import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile
from app.core.config import settings
import uuid

class StorageService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
        )
        self.bucket_name = settings.S3_BUCKET
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            try:
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            except ClientError as e:
                print(f"Could not create bucket: {e}")

    async def upload_file(self, file: UploadFile) -> str:
        file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
        s3_key = f"{uuid.uuid4()}.{file_extension}"
        
        try:
            self.s3_client.upload_fileobj(
                file.file,
                self.bucket_name,
                s3_key,
                ExtraArgs={"ContentType": file.content_type}
            )
            return s3_key
        except ClientError as e:
            print(f"Error uploading file: {e}")
            raise e

    def get_presigned_url(self, s3_key: str, expiration: int = 3600) -> str:
        try:
            response = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            return ""

    def delete_file(self, s3_key: str):
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
        except ClientError as e:
            print(f"Error deleting file: {e}")

storage_service = StorageService()
