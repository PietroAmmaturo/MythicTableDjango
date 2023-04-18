from .exceptions import FileStorageException
from .models import File
from .serializers import FileDBSerializer
import pymongo
from bson import ObjectId

client = pymongo.MongoClient('mongodb://admin:abc123!@localhost')
for dbn in client.list_database_names():
    print("db", dbn)
    db = client[dbn]
    for coll in db.list_collection_names():
        print("coll", coll)
db = client['admin']
files_collection = db["files"]

class MongoDbFileProvider:
    def delete(file_id: str, user_id: str) -> File:
        file = MongoDbFileProvider.get(file_id, user_id)
        result = files_collection.delete_one({"_id": ObjectId(file_id)})
        if (not result.acknowledged):
            message = f"Unable to delete file of _id: {file_id}, result {result}"
            raise FileStorageException(message)
        return file


    def get(file_id: str, user_id: str) -> File:
        filter = {"_id": ObjectId(file_id)}
        dto = files_collection.find_one(filter)
        if dto is None:
            raise FileStorageException(f"Could not find file of _id: '{file_id}'")
        # Deserialization
        serializer = FileDBSerializer(data=dto)
        if not serializer.is_valid():
            message = f"The file of _id: '{file_id}' stored in the DB is not valid; {serializer.errors}"
            raise FileStorageException(message)
        file = serializer.create(serializer.validated_data)
        if file.user != user_id:
            raise FileStorageException(f"File '{file_id}' does not belong to user '{user_id}'")
        return file

    def get_all(user_id: str) -> list[File]:
        filter = {"user": user_id}
        dtos = files_collection.find(filter)
        # Deserialization
        serializer = FileDBSerializer(data=dtos, many = True)
        if not serializer.is_valid():
            message = f"The one or more files of user: '{user_id}' stored in the DB are not valid; {serializer.errors}"
            raise FileStorageException(message)
        files = serializer.create(serializer.validated_data)
        return files

    def filter(user_id: str, file_filter: str) -> list[File]:
        mongo_filter = {"user": user_id}
        if file_filter is not None and file_filter is not None and file_filter != "":
            mongo_filter["path"] = file_filter
        dtos = files_collection.find(mongo_filter)
        # Deserialization
        serializer = FileDBSerializer(data=dtos, many = True)
        if not serializer.is_valid():
            message = f"The one or more files of user: '{user_id}' stored in the DB are not valid; {serializer.errors}"
            raise FileStorageException(message)
        files = serializer.create(serializer.validated_data)
        return files

    def create(file: File) -> File:
        # Serialization
        serializer = FileDBSerializer(file)
        new_file = serializer.data
        del new_file['_id']
        result = files_collection.insert_one(new_file)
        if (not result.acknowledged):
            message = f"Unable to create file, result {result}"
            raise FileStorageException(message)
        file._id = result.inserted_id
        return file

    def find_duplicate(user_id: str, md5: str) -> File:
        filter_query = {"user": user_id, "md5": md5}
        dto = files_collection.find_one(filter_query)
        if dto is None:
            return dto
        # Deserialization
        serializer = FileDBSerializer(data=dto)
        if not serializer.is_valid():
            message = f"The file of md5: '{md5}' stored in the DB is not valid; {serializer.errors}"
            raise FileStorageException(message)
        file = serializer.create(serializer.validated_data)
        return file