import re
from bson import ObjectId
from bson.json_util import loads, dumps
from bson.errors import InvalidId

class JsonPatchTranslator:
    def json_path_to_mongo_path(path: str) -> str:
        new_path = path[1:].replace("/", ".")
        new_path = re.sub("\\.$", "", new_path, count=1)
        return new_path

    def json_path_to_mongo_character_path(path: str) -> str:
        new_path = path[1:]

        for root in ["Token", "Attributes", "Asset"]:
            new_path = re.sub(f"^{root.lower()}", root, new_path, count=1)

        new_path = new_path.replace("/", ".")
        new_path = re.sub("\\.$", "", new_path, count=1)
        return "Characters.$." + new_path

    def json_path_to_mongo_array_name(path: str) -> str:
        formatted_path = JsonPatchTranslator.json_path_to_mongo_path(path)
        return formatted_path[: formatted_path.rfind(".")]

    def path_is_array(path: str) -> bool:
        path_arr = path.split("/")
        return path_arr[-1].isdigit()

    def json_to_bson(json_obj):
        if json_obj is None:
            raise ValueError("Json2Bson unexpected type: null")

        if isinstance(json_obj, str):
            return str(json_obj)

        if isinstance(json_obj, int):
            return json_obj

        if isinstance(json_obj, float):
            return json_obj

        if isinstance(json_obj, bool):
            return json_obj

        if isinstance(json_obj, dict):
            return loads(dumps(json_obj))

        if isinstance(json_obj, list):
            return [JsonPatchTranslator.json_to_bson(item) for item in json_obj]

        raise ValueError(f"Json2Bson unexpected type: {type(json_obj)}")