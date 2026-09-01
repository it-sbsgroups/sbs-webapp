This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

</hr>

## Step 1: Download MySQL Installer

1. Download the MySQL Installer for Windows from the official MySQL website:

   https://dev.mysql.com/downloads/installer/

2. Select the second download option:

```bash
mysql-installer-community-8.0.46.0.msi
```

3. Click **Download**.

4. On the next page, you may be asked to sign in or create an Oracle account. You do not need to create an account.

5. Click **"No thanks, just start my download."**

6. The MySQL Installer will begin downloading automatically.

7. Once the download is complete, proceed to **Step 2: Install MySQL**.

# Install MySQL (Oracle)

## Step 1: Download MySQL Installer

Download MySQL Installer for Windows from the official MySQL website:

https://dev.mysql.com/downloads/installer/

Select the second download option:

```bash
mysql-installer-community-8.0.46.0.msi
```

Click **Download**.

On the next page, you may be asked to sign in or create an Oracle account. You do not need to create an account.

Click **"No thanks, just start my download."** and the download will begin automatically.

---

## Step 2: Install MySQL

1. Run the downloaded installer.
2. Allow administrator access if prompted.
3. Select **Custom** installation type and click **Next**.

### Set Root Password

During the MySQL Server configuration process, you will be asked to create a **root password**.

> ⚠️ **Important**
>
> - This password is required whenever you log in to MySQL as the `root` user.
> - Choose a strong password and keep it safe.
> - Do not forget this password. Although it can be reset later, the process is not straightforward and may require additional configuration.

Example:

```text
Username: root
Password: YourStrongPassword
```

After setting the root password, continue with the installation.

### Select MySQL Components

Expand the available packages using the **+** icons and select the following components:

- MySQL Server
- MySQL Workbench
- MySQL Shell

Click **Next** and continue with the default settings until the installation is complete.

---

## Step 3: Add MySQL to Environment Variables

After installation:

1. Press the **Windows** key.
2. Search for **Edit environment variables for your account**.
3. Open it.
4. Under **User variables**, select **Path**.
5. Click **Edit**.
6. Click **New**.
7. Add the path to the MySQL `bin` directory.

Typical location:

```bash
C:\Program Files\MySQL\MySQL Server\bin
```

If your MySQL version folder is different, navigate to:

```text
C:
└── Program Files
    └── MySQL
        └── MySQL Server
            └── bin
```

Copy the path of the `bin` folder and paste it into the new Path entry.

Click **OK** to save all changes.

---

## Step 4: Verify Installation

Open **Command Prompt** as Administrator and run:

```bash
mysql --version
```

If MySQL is installed correctly, you will see version information similar to:

```bash
mysql  Ver 8.x.x for Win64
```

If the command is not recognized:

- Verify that MySQL was installed successfully.
- Ensure the MySQL `bin` path was added correctly to the environment variables.
- Restart Command Prompt and try again.

---

## Installed Applications

After installation, you should see:

- MySQL Command Line Client
- MySQL Workbench
- MySQL Shell

You can use these tools to manage and interact with your MySQL databases.