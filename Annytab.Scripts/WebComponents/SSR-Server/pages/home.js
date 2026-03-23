export const routes = {
    'GET /': {
        layout: 'defaultlayout',
        middleware: ['logger'],
        handler: async () => {
            return {
                title: 'Home',
                body: `
          <h1>Home</h1>
          <fancy-card>Auto island</fancy-card>
        `
            };
        }
    },
    'GET /user/:id': {
        layout: 'defaultlayout',
        middleware: ['logger'],
        handler: async (ctx) => {

            return {
                title: 'User',
                body: `
          <h1>User</h1>
          <p>Välkommen, användare ${ ctx.params.id }</p>
          <fancy-card>Auto island</fancy-card>
        `
            };
        }
    }
};
