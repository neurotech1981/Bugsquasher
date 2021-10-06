module.exports = (field, select) => function (next) {
  this.populate(field, select);
  next();
};