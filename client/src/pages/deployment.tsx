import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CodeBlock } from "@/components/ui/code-block";
import { Link } from "wouter";

export default function Deployment() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Deployment Options</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Docker Compose Deployment</h3>
            <p className="text-slate-600 mb-4">
              The simplest way to deploy Omnivore is using Docker Compose, which will set up all required services:
            </p>
            
            <CodeBlock language="yaml">
{`# docker-compose.yml
version: '3'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: omnivore
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  typesense:
    image: typesense/typesense:0.23.1
    environment:
      TYPESENSE_API_KEY: xyz
      TYPESENSE_DATA_DIR: /data
    volumes:
      - typesense_data:/data
    restart: always

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    restart: always

  api:
    build:
      context: .
      dockerfile: ./packages/api/Dockerfile
    depends_on:
      - postgres
      - typesense
      - minio
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASS: postgres
      DB_NAME: omnivore
      TYPESENSE_HOST: typesense
      TYPESENSE_PORT: 8108
      TYPESENSE_API_KEY: xyz
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: minioadmin
      S3_SECRET_KEY: minioadmin
      S3_BUCKET_NAME: omnivore
      JWT_SECRET: your_jwt_secret_here
    restart: always

  web:
    build:
      context: .
      dockerfile: ./packages/web/Dockerfile
    depends_on:
      - api
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://your-domain.com/api
      NEXT_PUBLIC_APP_URL: http://your-domain.com
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
      - ./nginx/certbot/conf:/etc/letsencrypt
      - ./nginx/certbot/www:/var/www/certbot
    depends_on:
      - api
      - web
    restart: always

volumes:
  postgres_data:
  typesense_data:
  minio_data:`}
            </CodeBlock>
            
            <p className="text-slate-600 mt-4">
              Save this to a file named <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">docker-compose.yml</code> in your project root, 
              then run:
            </p>
            
            <CodeBlock language="bash">
              {`docker-compose up -d`}
            </CodeBlock>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Nginx Configuration</h3>
            <p className="text-slate-600 mb-4">
              Set up Nginx as a reverse proxy for your application:
            </p>
            
            <CodeBlock language="nginx">
{`# nginx/conf/omnivore.conf
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://api:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}
            </CodeBlock>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Setting Up SSL with Let's Encrypt</h3>
            <p className="text-slate-600 mb-4">
              Secure your deployment with SSL using Let's Encrypt:
            </p>
            
            <CodeBlock language="bash">
{`# Initialize Certbot
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d your-domain.com --email your-email@example.com --agree-tos --no-eff-email`}
            </CodeBlock>
            
            <p className="text-slate-600 mt-4">
              Update your Nginx configuration to use SSL:
            </p>
            
            <CodeBlock language="nginx">
{`# nginx/conf/omnivore.conf (updated for SSL)
server {
    listen 80;
    server_name your-domain.com;
    location / {
        return 301 https://$host$request_uri;
    }
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://api:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}
            </CodeBlock>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Alternative Deployment Options</h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-medium text-slate-900 mb-2">Kubernetes Deployment</h4>
            <p className="text-slate-600 mb-4">
              For larger deployments or more complex setups, you can use Kubernetes:
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    The repository may contain Kubernetes manifests in the <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">/deployment</code> directory.
                    Check there first for existing configurations you can adapt.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-slate-600">
              You'll need to create Kubernetes manifests for each component (PostgreSQL, Typesense, API server, web client),
              configure persistent storage, and set up ingress resources.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">Using Cloud Services</h4>
            <p className="text-slate-600 mb-4">
              You can also leverage cloud services for parts of your deployment:
            </p>
            
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li>Use Amazon RDS or Google Cloud SQL instead of self-managed PostgreSQL</li>
              <li>Use Amazon S3 or Google Cloud Storage instead of MinIO</li>
              <li>Deploy the application to App Engine, Elastic Beanstalk, or similar services</li>
            </ul>
            
            <p className="text-slate-600 mt-4">
              This approach can simplify management but may increase costs compared to self-hosting everything.
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/faq">
              <a className="text-primary hover:underline font-medium">Continue to FAQ →</a>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
