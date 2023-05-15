from .exceptions import FileStorageException
from .models import File
from .serializers import FileDBSerializer
import pymongo
from bson import ObjectId
from MythicTable.providers import MongoDbProvider

class MongoDbFileProvider(MongoDbProvider):
    def __init__(self, client=None, db_name=None):
        super().__init__(client, db_name)
        self.files_collection = self.db['files']

    def delete(self, file_id: str, profile_id: str) -> File:
        file = MongoDbFileProvider.get(file_id, profile_id)
        result = self.files_collection.delete_one({"_id": ObjectId(file_id)})
        if (not result.acknowledged):
            message = f"Unable to delete file of _id: {file_id}, result {result}"
            raise FileStorageException(message)
        return file


    def get(self, file_id: str, profile_id: str) -> File:
        filter = {"_id": ObjectId(file_id)}
        dto = self.files_collection.find_one(filter)
        if dto is None:
            raise FileStorageException(f"Could not find file of _id: '{file_id}'")
        # Deserialization
        serializer = FileDBSerializer(data=dto)
        if not serializer.is_valid():
            message = f"The file of _id: '{file_id}' stored in the DB is not valid; {serializer.errors}"
            raise FileStorageException(message)
        file = serializer.create(serializer.validated_data)
        if file.user != profile_id:
            raise FileStorageException(f"File '{file_id}' does not belong to user '{profile_id}'")
        return file

    def get_all(self, profile_id: str) -> list[File]:
        filter = {"user": profile_id}
        dtos = self.files_collection.find(filter)
        # Deserialization
        serializer = FileDBSerializer(data=list(dtos), many = True)
        if not serializer.is_valid():
            message = f"The one or more files of user: '{profile_id}' stored in the DB are not valid; {serializer.errors}"
            raise FileStorageException(message)
        files = serializer.create(serializer.validated_data)
        return files

    def filter(self, profile_id: str, file_filter: str) -> list[File]:
        mongo_filter = {"user": profile_id}
        if file_filter is not None and file_filter is not None and file_filter != "":
            mongo_filter["path"] = file_filter
        dtos = self.files_collection.find(mongo_filter)
        # Deserialization
        serializer = FileDBSerializer(data=list(dtos), many = True)
        if not serializer.is_valid():
            message = f"The one or more files of user: '{profile_id}' stored in the DB are not valid; {serializer.errors}"
            raise FileStorageException(message)
        files = serializer.create(serializer.validated_data)
        return files

    def create(self, file: File) -> File:
        # Serialization
        serializer = FileDBSerializer(file)
        new_file = serializer.data
        del new_file['_id']
        result = self.files_collection.insert_one(new_file)
        if (not result.acknowledged):
            message = f"Unable to create file, result {result}"
            raise FileStorageException(message)
        file._id = result.inserted_id
        return file

    def find_duplicate(self, profile_id: str, md5: str) -> File:
        filter_query = {"user": profile_id, "md5": md5}
        dto = self.files_collection.find_one(filter_query)
        if dto is None:
            return dto
        # Deserialization
        serializer = FileDBSerializer(data=dto)
        if not serializer.is_valid():
            message = f"The file of md5: '{md5}' stored in the DB is not valid; {serializer.errors}"
            raise FileStorageException(message)
        file = serializer.create(serializer.validated_data)
        return file