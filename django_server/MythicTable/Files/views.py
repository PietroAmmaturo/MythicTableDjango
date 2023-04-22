from .serializers import FileAPISerializer
from .providers import MongoDbFileProvider
from Profile.providers import MongoDbProfileProvider
from .utils import FileUtils
from .stores import LocalFileStore
from MythicTable.views import AuthorizedView
from MythicTable.exceptions import MythicTableException
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

class LocalFileStoreView(AuthorizedView):
    def __init__(self, file_store=None):
        super().__init__()
        self.file_store = file_store or LocalFileStore()

class FileListView(LocalFileStoreView):
    def get(self, request, path=None, format=None):
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(MongoDbProfileProvider.get_by_user_id(user_id=user_id)._id)
        if path:
            files = MongoDbFileProvider.filter(profile_id=profile_id, file_filter=path)
        else:
            files = MongoDbFileProvider.get_all(profile_id=profile_id)
        serializer = FileAPISerializer(files, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(MongoDbProfileProvider.get_by_user_id(user_id=user_id)._id)
        path = request.query_params.get('path')
        uploaded_files = request.FILES.getlist('files')
        size = sum([uploaded_file.size for uploaded_file in uploaded_files])
        files = []
        for uploaded_file in uploaded_files:
            if uploaded_file.size <= 0:
                continue
            md5 = FileUtils.calculate_md5(uploaded_file)
            existing_file = MongoDbFileProvider.find_duplicate(user_id=profile_id, md5=md5)
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
            files.append(MongoDbFileProvider.create(file))
        serializer = FileAPISerializer(files, many=True)
        return Response({'count': len(files), 'size': size, 'files': serializer.data})
    
class FileView(LocalFileStoreView):
    def get(self, request, fileId=None, format=None):
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(MongoDbProfileProvider.get_by_user_id(user_id=user_id)._id)
        file = MongoDbFileProvider.get(file_id=fileId, profile_id=profile_id)
        serializer = FileAPISerializer(file)
        return Response(serializer.data)
    
    def delete(self, request, fileId=list[str], format=None):
        user_id = request.session["userinfo"]["sub"]
        profile_id = str(MongoDbProfileProvider.get_by_user_id(user_id=user_id)._id)
        files_to_delete = []
        files_found = []
        for file_id in fileId:
            file = MongoDbFileProvider.get(file_id, profile_id)
            MongoDbFileProvider.delete(file_id, profile_id)
            files_found.append(file)

            if MongoDbFileProvider.find_duplicate(file.user, file.md5) is None:
                files_to_delete.append(file)

        self.file_store.delete_files(files_to_delete)
        return Response({
            'count': len(files_to_delete),
            'ids': [f._id for f in files_found]
        })