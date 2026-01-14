# Redis Setup Guide for Windows

## Option 1: Using Docker (Recommended)

### Prerequisites
- Docker Desktop installed

### Steps

1. **Pull Redis Image**
```bash
docker pull redis:alpine
```

2. **Run Redis Container**
```bash
docker run -d --name lottery-redis -p 6379:6379 redis:alpine
```

3. **Verify Redis is Running**
```bash
docker ps
# Should show lottery-redis container

# Test connection
docker exec -it lottery-redis redis-cli ping
# Should return: PONG
```

4. **Start/Stop Commands**
```bash
# Stop
docker stop lottery-redis

# Start
docker start lottery-redis

# View logs
docker logs lottery-redis
```

---

## Option 2: Using Windows Installer

### Prerequisites
- Windows 10/11

### Steps

1. **Download Redis for Windows**
   - Visit: https://github.com/microsoftarchive/redis/releases
   - Download: Redis-x64-3.0.504.msi

2. **Install Redis**
   - Run installer
   - Keep default port (6379)
   - Check "Add to PATH"

3. **Start Redis Service**
```bash
# Open Services (services.msc)
# Find "Redis" and start it

# Or use command line
redis-server
```

4. **Test Connection**
```bash
redis-cli ping
# Should return: PONG
```

---

## Option 3: Using Chocolatey

```bash
# Install Chocolatey first (if not installed)
# Then:
choco install redis-64

# Start Redis
redis-server

# Test
redis-cli ping
```

---

## Configuration for Lottery App

### Update .env.redis

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### If using remote Redis (production):
```env
REDIS_HOST=your-redis-server.com
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
```

---

## Testing Worker Queue

After starting Redis:

1. **Restart API server**
```bash
npm run start:dev
```

2. **Check logs** - should not see Redis connection errors

3. **Test Prize Checking**
   - Go to Admin Dashboard
   - Announce results for a round
   - Check logs for queue processing
   - Verify tickets are checked automatically

---

## Redis GUI Tools (Optional)

For easier management:
- **RedisInsight**: https://redis.com/redis-enterprise/redis-insight/
- **Another Redis Desktop Manager**: https://github.com/qishibo/AnotherRedisDesktopManager

---

## Troubleshooting

### Error: ECONNREFUSED
- Redis is not running
- Solution: Start Redis container/service

### Error: WRONGTYPE
- Queue data corrupted
- Solution: Flush Redis
```bash
redis-cli FLUSHALL
```

### Port 6379 already in use
- Another Redis instance running
- Solution: Stop other instance or use different port

---

## Production Considerations

### Security
```bash
# Set password
redis-cli CONFIG SET requirepass "your-strong-password"

# Update .env
REDIS_PASSWORD=your-strong-password
```

### Persistence
```bash
# Enable AOF (Append Only File)
redis-cli CONFIG SET appendonly yes
```

### Memory Limit
```bash
# Set max memory (e.g., 256MB)
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

---

## Recommended: Docker Compose

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  redis:
    image: redis:alpine
    container_name: lottery-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis-data:
```

Run with:
```bash
docker-compose up -d
```

---

**Next Step**: After Redis is running, test the Worker Queue prize checking feature!
