export default ({ title, body }) => `
<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<meta charset="utf-8"></meta>
<body>
<header style="background:#333;color:#fff;padding:1rem;">
  Default Layout - ${title}
</header>
<main>${body}</main>
</body>
</html>
`;
