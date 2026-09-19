# Copilot Agent Task: Create ASP.NET Core MVC with Identity

## Objective
Create a new ASP.NET Core MVC project with ASP.NET Core Identity for Login and Sign Up, initialize the database schema, and run migrations.

## Project Requirements

### 1. Project Creation
- Create new ASP.NET Core MVC project using .NET 8 / .NET 7
- Name: `MvcIdentityApp`
- Framework: `net8.0`
- Use command: `dotnet new mvc -n MvcIdentityApp -au Individual`
- Target folder: current directory
- Ensure project uses `Microsoft.AspNetCore.Identity`

### 2. Packages to Install / Verify
Ensure these packages are referenced:
- Microsoft.AspNetCore.Identity.EntityFrameworkCore
- Microsoft.AspNetCore.Identity.UI
- Microsoft.EntityFrameworkCore
- Microsoft.EntityFrameworkCore.SqlServer
- Microsoft.EntityFrameworkCore.Tools
- Microsoft.EntityFrameworkCore.Design

Run:
```bash
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Identity.UI
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.EntityFrameworkCore.Design
```

### 3. Database & Identity Setup

**a. Connection String**
In `appsettings.json` add:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MvcIdentityAppDb;Trusted_Connection=True;MultipleActiveResultSets=true"
}
```

**b. DbContext**
Create `Data/ApplicationDbContext.cs`:
- Inherit from `IdentityDbContext<IdentityUser>`
- Constructor with `DbContextOptions<ApplicationDbContext>`
- Register in `Program.cs`:
```csharp
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

**c. Program.cs Configuration**
Add Identity services in `Program.cs`:
```csharp
builder.Services.AddDefaultIdentity<IdentityUser>(options => {
    options.SignIn.RequireConfirmedAccount = false;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
}).AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();
```
And in pipeline:
```csharp
app.UseAuthentication();
app.UseAuthorization();
app.MapRazorPages();
```

### 4. Scaffold Identity
Scaffold Identity UI to generate views for login/signup:
```bash
dotnet aspnet-codegenerator identity -dc MvcIdentityApp.Data.ApplicationDbContext --files "Account.Register;Account.Login;Account.Logout;Account.Manage._Layout"
```
If codegenerator not installed:
```bash
dotnet tool install -g dotnet-aspnet-codegenerator
dotnet tool install -g dotnet-ef
```
This should generate:
- `/Areas/Identity/Pages/Account/Register.cshtml`
- `/Areas/Identity/Pages/Account/Login.cshtml`
- `/Areas/Identity/Pages/Account/Logout.cshtml`
- `/Areas/Identity/Pages/Account/Manage/*`
- `/Views/Shared/_LoginPartial.cshtml`

### 5. Customize Views

**_LoginPartial.cshtml**
Update `_Layout.cshtml` to include:
```cshtml
<partial name="_LoginPartial" />
```
In navbar.

**Register.cshtml Requirements:**
- Fields: Email, Password, ConfirmPassword
- Use `Input` model with validation tags: `asp-validation-for`
- Bootstrap 5 styling: `form-control`, `btn btn-primary w-100`
- Link to Login page

**Login.cshtml Requirements:**
- Fields: Email, Password, RememberMe checkbox
- Validation summary
- Link to Register and Forgot Password
- Bootstrap 5 styling

**_ViewImports.cshtml**
Ensure in `/Areas/Identity/Pages/_ViewImports.cshtml` and `/Views/_ViewImports.cshtml`:
```cshtml
@using Microsoft.AspNetCore.Identity
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
```

### 6. Migrations & Database Initialization
Run these commands in order:
```bash
dotnet ef migrations add InitialIdentitySchema -o Data/Migrations
dotnet ef database update
```
If database fails, drop and recreate:
```bash
dotnet ef database drop --force
dotnet ef database update
```

### 7. Final Checks
- Build must succeed: `dotnet build`
- Run app: `dotnet run`
- Test routes:
  - `/Identity/Account/Register` -> should create user and redirect to home
  - `/Identity/Account/Login` -> should login existing user
  - Home page should show email when logged in, and show Register/Login when logged out

### 8. Folder Structure Expected
```
/Data/ApplicationDbContext.cs
/Data/Migrations/
/Areas/Identity/Pages/Account/Register.cshtml
/Areas/Identity/Pages/Account/Login.cshtml
/Views/Shared/_Layout.cshtml
/Views/Shared/_LoginPartial.cshtml
Program.cs
appsettings.json
```

### 9. Do Not
- Do not use custom User model initially, use IdentityUser
- Do not skip AddRazorPages or MapRazorPages or login will 404
- Do not hardcode connection string, use appsettings.json

## Completion Criteria
Project builds, migration applied, you can register a new user and login/logout works with UI.
