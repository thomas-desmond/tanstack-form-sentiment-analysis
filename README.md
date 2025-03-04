# TanStack Forms with Cloudflare Workers AI

This is a React application using experimenting with TanStack Forms and Cloudflare Workers AI. The app takes in your feedback and presents you with a friendly analysis of the feedback. 

Note that this repository uses npm workspaces to manage dependencies. You can run either Worker's npm commands from the root of the repository by adding either -w client or -w worker to your npm command.

![image](https://github.com/user-attachments/assets/1ee088e2-50d5-49a2-96e1-a32b89ef1991)


## Deployment Instructions

## Steps

1. **Clone the repository**
2. **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Deploy your Workers Project**
    - In the root of the project run `npm run deploy -w worker`
    - Copy the deployment URL for your Worker

4. **Point the client app at your Worker**
    - In `App.tsx` modify `WORKER_URL` value to your deployed Worker URL

5. **Deploy the frontend client application**
    - `npm run deploy -w client`

6. **Verify deployment**
    - Visit the URL provided by Cloudflare to ensure the app is running correctly.
