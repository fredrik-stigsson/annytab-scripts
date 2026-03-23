export default ({ title, body }) => `
<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<body>
<header style="background:red;color:white;padding:1rem;">
  Admin Panel
</header>
<aside>Sidebar</aside>
<main>${body}</main>
</body>
</html>
`;
