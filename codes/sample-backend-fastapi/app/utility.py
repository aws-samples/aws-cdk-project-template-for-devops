import os

import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

# https://docs.aws.amazon.com/ko_kr/amazondynamodb/latest/developerguide/GettingStarted.Python.03.html
class DDBHandler(object):

    def __init__(self, table_name: str):
        super().__init__()
        try:
            service_name = 'dynamodb'
            self.resource = boto3.resource(service_name)
            self.table = self.resource.Table(table_name)
        except ClientError as e:
            print('[ERROR] init ClientError', e)


    def get_items_count(self):
        try:
            response = self.table.scan(
            )
            print('[SUCCESS] get_items_count: response', response)
            return response['Count']
        except ClientError as e:
            print('[ERROR] get_items_count', e)
            return None


    def put_item(self, item: dict):
        try:
            response = self.table.put_item(Item=item)
            print('[SUCCESS] put_item: response', response)
        except ClientError as e:
            print('[ERROR] put_item', e)
            return False
        return True
