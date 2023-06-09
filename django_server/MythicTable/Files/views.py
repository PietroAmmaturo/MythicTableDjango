from .serializers import FileAPISerializer
from .providers import MongoDbFileProvider
from Profile.providers import MongoDbProfileProvider
from .utils import FileUtils
from .stores import LocalFileStore
from MythicTable.views import AuthorizedView
from MythicTable.exceptions import MythicTableException
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
import pymongo
from django.conf import settings

class LocalFileStoreView(AuthorizedView):
    def __init__(self, file_store=None):
        super().__init__()
        self.file_store = file_store or LocalFileStore()

class FileProviderView(LocalFileStoreView):
    client = None
    db_name = None
    file_provider = None
    profile_provider = None
    def __init__(self, profile_provider=None, file_provider=None, client=None, db_name=None):
        super().__init__()
        self.client = client
        self.db_name = db_name
        self.file_provider = file_provider or MongoDbFileProvider(self.client, self.db_name)
        self.profile_provider = profile_provider or MongoDbProfileProvider(self.client, self.db_name)

class FileListView(FileProviderView):
    def get(self, request, path=None):
        """
        Get a list of files.

        Args:
            request (HttpRequest): The HTTP request object.
            path (Optional[str]): The path to filter files. If not provided, all files will be returned.
            format (Optional[str]): The format of the response.

        Returns:
            Response: The response containing the serialized files.
        """
        # Extension: store user_id and profile_id with a caching system to avoid JWT authentication and DB Lookup every time a request is made
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id)._id)
        if path:
            files = self.file_provider.filter(profile_id, path)
        else:
            files = self.file_provider.get_all(profile_id)
        serializer = FileAPISerializer(files, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """
        Upload files.

        Args:
            request (HttpRequest): The HTTP request object.

        Returns:
            Response: The response containing information about the uploaded files.
        """
        # Extension: store user_id and profile_id with a caching system to avoid JWT authentication and DB Lookup every time a request is made
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id)._id)
        path = request.query_params.get('path')
        uploaded_files = request.FILES.getlist('files')
        size = sum([uploaded_file.size for uploaded_file in uploaded_files])
        files = []
        for uploaded_file in uploaded_files:
            if uploaded_file.size <= 0:
                continue
            md5 = FileUtils.calculate_md5(uploaded_file)
            existing_file = self.file_provider.find_duplicate(profile_id, md5)
            store_data = {'reference': existing_file.reference, 'url': existing_file.url} if existing_file else self.file_store.save_file(uploaded_file, profile_id)
            file_data = {
                "reference" : f"{store_data['reference']}",
                "url" : f"{store_data['url']}",
                "user" : f"{profile_id}",
                "path" : f"{path}",
                "name" : f"{uploaded_file.name}",
                "md5" : f"{md5}"
                }
            serializer = FileAPISerializer(data=file_data)
            if not serializer.is_valid():
                message = f"One or more files are not valid: {serializer.errors}"
                raise MythicTableException(message)
            file = serializer.create(serializer.validated_data)
            files.append(self.file_provider.create(file))
        serializer = FileAPISerializer(files, many=True)
        return Response({'count': len(files), 'size': size, 'files': serializer.data})
    
class FileView(FileProviderView):
    def get(self, request, fileId=None):
        """
        Get a file by ID.

        Args:
            request (HttpRequest): The HTTP request object.
            fileId (Optional[str]): The ID of the file.

        Returns:
            Response: The response containing the serialized file.
        """
        # Extension: store user_id and profile_id with a caching system to avoid JWT authentication and DB Lookup every time a request is made
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id)._id)
        file = self.file_provider.get(fileId, profile_id)
        serializer = FileAPISerializer(file)
        return Response(serializer.data)
    
    #TODO: test this (this function is never used from the frontend)
    def delete(self, request, fileId=list[str]):
        """
        Delete files.

        Args:
            request (HttpRequest): The HTTP request object.
            fileId (List[str]): A list of file IDs to delete.

        Returns:
            Response: The response containing information about the deleted files.
        """
        # Extension: store user_id and profile_id with a caching system to avoid JWT authentication and DB Lookup every time a request is made
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(self.profile_provider.get_by_user_id(user_id)._id)
        files_to_delete = []
        files_found = []
        for file_id in fileId:
            file = self.file_provider.get(file_id, profile_id)
            self.file_provider.delete(file_id, profile_id)
            files_found.append(file)

            if self.file_provider.find_duplicate(file.user, file.md5) is None:
                files_to_delete.append(file)

        self.file_store.delete_files(files_to_delete)
        return Response({
            'count': len(files_to_delete),
            'ids': [f._id for f in files_found]
        })