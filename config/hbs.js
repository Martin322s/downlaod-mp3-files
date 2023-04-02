const hbs = require('express-handlebars');

exports.initViewEngine = (app) => {
    app.engine('hbs', hbs.engine({ extname: 'hbs' }));
    app.set('view engine', 'hbs');
}