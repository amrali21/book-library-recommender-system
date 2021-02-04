const express = require("express");

var router = express.Router();

router.get("/privacy-policy", (req, res, next) =>
{
    res.render("privacy-policy", {PageTitle: 'Privacy Policy', name: req.session.name, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});
});

//view term condition page
router.get("/terms-conditions", (req, res, next) =>
{
    res.render("terms-conditions", {PageTitle: 'Terms Conditions', name: req.session.name, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});
});

//view faq page
router.get("/faq", (req, res, next) =>
{
    console.log('heyheyhey');
    res.render("faq", {PageTitle: 'FAQ', name: req.session.name, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});
});

//view contact us page
router.get("/contact", (req, res, next) =>
{
    res.render("contact", {PageTitle: 'Contact', name: req.session.name, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});
});

//view about page
router.get("/about", (req, res, next) =>
{
    res.render("about", {PageTitle: 'About', name: req.session.name, is_admin: req.session.is_admin, isAuthenticated: req.session.isLoggedIn});
});

//view GwentGame page
router.get("/GwentGame", (req, res, next) =>
{
    res.render("Gwent");
});

module.exports = router;