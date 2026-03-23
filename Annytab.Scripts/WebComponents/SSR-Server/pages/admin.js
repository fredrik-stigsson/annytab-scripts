export const routes = {
    'GET /admin': {
        layout: 'adminlayout',
        middleware: ['logger'],
        handler: async () => {
            return {
                title: 'Dashboard',
                body: `
          <h2>Admin Dashboard</h2>
          <my-button>Manage</my-button>
        `
            };
        }
    }
};