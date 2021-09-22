import os
import uuid
import time
import json
import sys
import logging
import pymysql
import boto3
import base64
from botocore.exceptions import ClientError
from typing import Optional
from fastapi import FastAPI

_log_level = logging.INFO
logger = logging.getLogger()
logger.setLevel(_log_level)
log_handler = logging.StreamHandler(sys.stdout)
logger.addHandler(log_handler)

app = FastAPI()
conn = None

def get_secret(secret_name: str):
    try:
        session = boto3.session.Session()
        client = session.client(
            service_name='secretsmanager'
        )
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        print('get_secret---exception', e)
        if e.response['Error']['Code'] == 'DecryptionFailureException':
            raise e
        elif e.response['Error']['Code'] == 'InternalServiceErrorException':
            raise e
        elif e.response['Error']['Code'] == 'InvalidParameterException':
            raise e
        elif e.response['Error']['Code'] == 'InvalidRequestException':
            raise e
        elif e.response['Error']['Code'] == 'ResourceNotFoundException':
            raise e
    else:
        print('get_secret---else')
        if 'SecretString' in get_secret_value_response:
            secret = get_secret_value_response['SecretString']
            logger.info(f'11--->{secret}')
        else:
            secret = base64.b64decode(get_secret_value_response['SecretBinary'])
            logger.info(f'22--->{secret}')
        return secret


def connect_database(rds_host, rds_port, db_name, secret_value):
    user_info = json.loads(secret_value)
    user_name = user_info['username']
    user_pw = user_info['password']

    try:
        conn = pymysql.connect(host=rds_host, port=rds_port, user=user_name, passwd=user_pw, db=db_name, connect_timeout=5)
    except pymysql.MySQLError as e:
        logger.error("ERROR: Unexpected error: Could not connect to MySQL instance.")
        logger.error(e)
        sys.exit()
    else:
        return conn


def load_database():
    secrete_arn = os.environ.get('SECRETE_ARN', 'no-arn')
    print('SECRETE_ARN', secrete_arn)
    secret_value = get_secret(secrete_arn)
    
    host_name = os.environ.get('HOST_NAME', 'no-host')
    port_number = int(os.environ.get('PORT_NUMBER', '3306'))
    database_name = os.environ.get('DATABASE_NAME', 'no-database')
    global conn
    conn = connect_database(host_name, port_number, database_name, secret_value)


@app.get("/")
def read_root():
    logger.info('read_root')
    return {"Health": "Good"}


@app.get("/items")
def read_item():
    logger.info('get_items')

    if conn == None:
        load_database()

    items = []
    with conn.cursor() as cur:
        cur.execute("select * from Items")
        for row in cur:
            logger.info(row)
            items.append(row)
    conn.commit()

    return {'items': items}
