import sys
import argparse
from pymongo import MongoClient

# Connect to the primary (or any node that can route us to primary)
# For management, we need a direct connection or a connection that can run admin commands.
# We'll try to connect to localhost mapped ports first, assuming this script runs on host.
# If running inside docker, we'd use service names.
# Let's assume this runs on HOST, so we use localhost:27017 (primary usually).

def get_admin_client(host="localhost", port=27017):
    return MongoClient(host, port, directConnection=True)

def init_rs(args):
    print("Initializing Replica Set...")
    # This is usually done by the healthcheck in docker-compose, but we can have a manual trigger.
    # We connect to mongo1 (mapped to 27017)
    client = get_admin_client("mongo1", 27017)
    try:
        config = {
            "_id": "rs0",
            "members": [
                {"_id": 0, "host": "mongo1:27017"},
                {"_id": 1, "host": "mongo2:27018"},
                {"_id": 2, "host": "mongo3:27019"}
            ]
        }
        client.admin.command("replSetInitiate", config)
        print("Replica Set initialized.")
    except Exception as e:
        print(f"Error initializing RS: {e}")

def add_node(args):
    node_address = args.address
    print(f"Adding node {node_address} to Replica Set...")
    client = get_admin_client("mongo1", 27017)
    try:
        client.admin.command("replSetReconfig", client.admin.command("replSetGetConfig")['config'] | {'version': client.admin.command("replSetGetConfig")['config']['version'] + 1, 'members': client.admin.command("replSetGetConfig")['config']['members'] + [{"_id": max([m['_id'] for m in client.admin.command("replSetGetConfig")['config']['members']]) + 1, "host": node_address}]})
        
        config = client.admin.command("replSetGetConfig")['config']
        
        for member in config['members']:
            if member['host'] == node_address:
                print("Node already exists.")
                return

        new_id = max([m['_id'] for m in config['members']]) + 1
        new_member = {"_id": new_id, "host": node_address}
        config['members'].append(new_member)
        config['version'] += 1
        
        client.admin.command("replSetReconfig", config)
        print(f"Node {node_address} added.")
    except Exception as e:
        print(f"Error adding node: {e}")

def remove_node(args):
    node_address = args.address
    print(f"Removing node {node_address} from Replica Set...")
    client = get_admin_client("mongo1", 27017)
    try:
        config = client.admin.command("replSetGetConfig")['config']
        
        original_count = len(config['members'])
        config['members'] = [m for m in config['members'] if m['host'] != node_address]
        
        if len(config['members']) == original_count:
            print("Node not found in configuration.")
            return

        config['version'] += 1
        client.admin.command("replSetReconfig", config)
        print(f"Node {node_address} removed.")
    except Exception as e:
        print(f"Error removing node: {e}")

def list_nodes(args):
    client = get_admin_client("mongo1", 27017)
    try:
        status = client.admin.command("replSetGetStatus")
        print("Replica Set Status:")
        for member in status['members']:
            print(f"- ID: {member['_id']}, Host: {member['name']}, State: {member['stateStr']}")
    except Exception as e:
        print(f"Error getting status: {e}")

def read_data(args):
    limit = int(args.limit)
    print(f"Reading  {limit} audit logs...")
    client = get_admin_client("mongo1", 27017)
    try:
        db = client.ais_audit_db
        cursor = db.audit_logs.find().sort("timestamp", -1).limit(limit)
        count = 0
        for doc in cursor:
            print(doc)
            count += 1
        if count == 0:
            print("No logs found.")
    except Exception as e:
        print(f"Error reading data: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MongoDB Replica Set Manager")
    subparsers = parser.add_subparsers()

    parser_init = subparsers.add_parser('init', help='Initialize Replica Set')
    parser_init.set_defaults(func=init_rs)

    parser_add = subparsers.add_parser('add', help='Add a node to Replica Set')
    parser_add.add_argument('address', help='Host:Port of the new node (e.g., mongo4:27017)')
    parser_add.set_defaults(func=add_node)

    parser_remove = subparsers.add_parser('remove', help='Remove a node from Replica Set')
    parser_remove.add_argument('address', help='Host:Port of the node to remove')
    parser_remove.set_defaults(func=remove_node)

    parser_list = subparsers.add_parser('list', help='List nodes in Replica Set')
    parser_list.set_defaults(func=list_nodes)

    parser_read = subparsers.add_parser('read', help='Read audit logs')
    parser_read.add_argument('--limit', default=10, help='Number of logs to read')
    parser_read.set_defaults(func=read_data)

    args = parser.parse_args()
    if hasattr(args, 'func'):
        args.func(args)
    else:
        parser.print_help()
