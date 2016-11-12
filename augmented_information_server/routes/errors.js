/**
 * Created by ctdesk241 on 13/10/2014.
 */

module.exports = function(app) {

    app.use(function(err, req, res, next) {
        res.status(err.status || 500).json({message: err.message});
    });

};