# Deploy Backend to Railway (FREE)

## Railway has a FREE tier - $5/month credit (enough for waitlist backend)

### Quick Setup (5 minutes):

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose**: `MohamedAbirou/microplanner-v2`
6. **Configure**:
   - **Root Directory**: `apps/api-gateway`
   - Railway will auto-detect the Dockerfile!
7. **Add Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=your_database_url
   PORT=3001
   ```
8. **Deploy!** - Railway builds the Docker image and runs it

### Your Backend Will Be Live At:
`https://your-app.up.railway.app`

### Update Frontend CORS:
Already configured to allow `.railway.app` domains!

### Cost:
**FREE** - Railway gives $5/month credit
Your waitlist backend will use ~$2-3/month = **FREE**

---

## Alternative: Render (Also FREE)

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Root Directory: `apps/api-gateway`
5. Docker detected automatically
6. Add same environment variables
7. Deploy!

**Both Railway and Render are FREE for hobby projects!**
