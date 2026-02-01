# MongoDB Atlas Setup Guide for Context Flow

## Step 1: Get MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign up or log in to your account
3. Create a new cluster or use an existing one
4. Create a database user:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose a username and password (save these!)
   - Select "Read and write to any database"
   - Click "Add User"

5. Get your connection string:
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect to your application"
   - Select Node.js version
   - Copy the connection string

## Step 2: Update .env File

Open the `.env` file in your project root and update the `DATABASE_URL`:

```bash
# Replace these values with your actual MongoDB Atlas credentials:
DATABASE_URL="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/contextflow?retryWrites=true&w=majority&appName=ContextFlow"
```

**Important:**
- Replace `YOUR_USERNAME` with your database username
- Replace `YOUR_PASSWORD` with your database password (URL encode special characters if needed)
- Replace `YOUR_CLUSTER` with your actual cluster name
- `contextflow` is the database name (you can change this)
- Keep the `retryWrites=true&w=majority` parameters for best performance

## Step 3: Push Schema to MongoDB

After updating the `.env` file, run:

```bash
bun run db:push
```

This will create the collections in MongoDB based on your Prisma schema.

## Step 4: Start the Application

```bash
bun run dev
```

## MongoDB Atlas Network Access

If you encounter connection errors, check network access:

1. Go to "Network Access" in MongoDB Atlas
2. Click "Add IP Address"
3. Choose one of:
   - **Allow Access from Anywhere** (easiest for development)
   - Add your specific IP address

## Connection String Example

A typical MongoDB Atlas connection string looks like:

```
mongodb+srv://myuser:password123@cluster0.abcde.mongodb.net/contextflow?retryWrites=true&w=majority&appName=ContextFlow
```

## Troubleshooting

### Connection Timeout
- Check if your IP is whitelisted in Network Access
- Verify your username and password are correct
- Ensure the cluster is running (check MongoDB Atlas dashboard)

### Schema Push Issues
- Make sure your MongoDB Atlas cluster is on the FREE tier or higher
- Verify the database name in the connection string matches what you want
- Check that you have proper permissions (Read and Write)

### Special Characters in Password
If your password contains special characters like `@`, `:`, `/`, or `?`, you need to URL encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`

## Prisma with MongoDB Notes

- MongoDB is a NoSQL database, so some SQL features aren't available
- `onDelete: Cascade` is not supported (MongoDB doesn't have foreign keys)
- Relations are managed by Prisma, not the database
- Schema migrations work differently - use `prisma db push` for development

## Additional Resources

- [Prisma MongoDB Documentation](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Connection String URI Format](https://www.mongodb.com/docs/manual/reference/connection-string/)
