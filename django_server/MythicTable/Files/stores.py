import os
import random
import string
import datetime
from uuid import uuid4
from io import BytesIO
from pathlib import Path
from .models import File
from django.core.files.uploadedfile import UploadedFile
from django.conf import settings

class IFileStore:
    def save_file(self, form_file: bytes, user_id: str) -> File:
        pass

    def delete_files(self, files: list[File]) -> None:
        pass


class LocalFileStore(IFileStore):
    def __init__(self, path: str = settings.MEDIA_ROOT, url_prefix: str = settings.SERVER_URL + settings.MEDIA_URL):
        self.path = path
        self.url_prefix = url_prefix

    def save_file(self, form_file: UploadedFile, user_id: str) -> File:
        file_name = self._create_random_file_name(form_file.name, user_id)
        file_path = os.path.join(self.path, file_name)
        FileWriter.create_directory(os.path.dirname(file_path))
        path = FileWriter.copy_to_file(form_file, file_path)
        print(path)
        return {"reference": path, "url": self.url_prefix + file_name}

    def delete_files(self, files: list[File]) -> None:
        FileWriter.delete_files([f.reference for f in files])

    def _create_random_file_name(self, original_name: str, user_id: str) -> str:
        random_str = ''.join(random.choices(string.ascii_lowercase, k=6))
        time_str = datetime.datetime.utcnow().strftime("%Y-%m-%d-%H-%M-%S-%f")
        return f"{random_str}-{user_id}-{time_str}{Path(original_name).suffix}"

class IFileWriter:
    def create_directory(path: str) -> None:
        pass

    def copy_to_file(file: BytesIO, file_path: str) -> str:
        pass

    def delete_files(file_paths: list[str]) -> None:
        pass


class FileWriter(IFileWriter):
    def create_directory(path: str) -> None:
        os.makedirs(path, exist_ok=True)
    
    def copy_to_file(file: UploadedFile, file_path: str):
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

    def delete_files(file_paths: list[str]) -> None:
        for path in file_paths:
            os.remove(path)
