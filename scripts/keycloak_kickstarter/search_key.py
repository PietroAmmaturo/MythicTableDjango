#!/usr/bin/env python3

from typing import List, Dict
from keycloak import KeycloakAdmin
import pandas as pd
import getpass
import sys

KEYCLOAK_LOGIN={
    "server_url": "https://key.mythictable.com/auth/",
    "realm_name": "MythicTable"
}


def find_group(level, group_list: List[Dict]):
    for group in group_list:
        if f"{level} Kickstarter" == group["name"]:
            return group
    return None


def get_csv(fname: str) -> pd.DataFrame:
    df = pd.read_csv(fname, index_col=0)

    df: pd.DataFrame = df[["Email", "Reward Title"]]
    return df

def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <CSV FILE>")
        exit(1)

    uname = input("Enter admin email: ")
    passwd = getpass.getpass("Enter admin passwd: ")
    kc_adm = KeycloakAdmin(**KEYCLOAK_LOGIN, username=uname, password=passwd)

    groups = kc_adm.get_groups({"name": ".* Kickstarter"})
    users = get_csv()
    users["Reward Title"] = users["Reward Title"].apply(lambda x: str(x).split(' ')[-1])
    
    print(groups)
    for user in users.iterrows():
        user_details = user[-1]
        user_group = find_group(user_details['Reward Title'], groups)
        try:
            kc_user = kc_adm.get_users({'email': user_details['Email']})[0]
        except IndexError:
            print(f"No such user {user_details['Email']}")

        if user_group is not None:
            uid = kc_user['id']
            gid = find_group(user_details['Reward Title'], groups)['id']
            kc_adm.group_user_add(uid, gid)
            print(f"{user_details['Email']}: {find_group(user_details['Reward Title'], groups)['name']}")


if __name__ == "__main__":
    main()

