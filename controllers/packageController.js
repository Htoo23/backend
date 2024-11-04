const Package = require('../models/package');

exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.find({ country: req.user.country });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.buyPackage = async (req, res) => {
  const { packageId } = req.body;
  try {
    const package = await Package.findById(packageId);
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }
    if (package.country !== req.user.country) {
      return res.status(403).json({ error: 'Package not available in your country' });
    }
    package.users.push(req.user._id);
    await package.save();

    req.user.packages.push(package._id);
    await req.user.save();

    res.json({ message: 'Package purchased successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

