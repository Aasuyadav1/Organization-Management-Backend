import { Organization } from "../models/organization-model.js";
import { User } from "../models/user-model.js";

// create organization
const createOrganization = async (req, res) => {
  try {
    const { name, description, logo } = req.body;
    const organization = new Organization({
      name,
      description,
      logo,
      owner: req.user._id,
      members: [{ userId: req.user._id, role: "Owner" }],
    });

    await organization.save();

    // Update user's organizations
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        organizations: { organizationId: organization._id, role: "Owner" },
      },
    });

    res.status(201).json(organization);
  } catch (error) {
    res.status(500).json({ message: "Failed to create organization" });
  }
};

// update organization
const updateOrganization = async (req, res) => {
  try {
    const { name, description, logo } = req.body;
    const organization = await Organization.findByIdAndUpdate(
      req.params.orgId,
      { name, description, logo },
      { new: true }
    );
    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: "Failed to update organization" });
  }
};

// delete organization
const deleteOrganization = async (req, res) => {
  try {
    await Organization.findByIdAndDelete(req.params.orgId);
    // Remove organization from all users
    await User.updateMany(
      { "organizations.organizationId": req.params.orgId },
      { $pull: { organizations: { organizationId: req.params.orgId } } }
    );
    res.json({ message: "Organization deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete organization" });
  }
};

// update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { orgId, userId } = req.params;

    // Update role in organization
    const organization = await Organization.findOneAndUpdate(
      {
        _id: orgId,
        "members.userId": userId,
      },
      {
        $set: { "members.$.role": role },
      },
      { new: true }
    );

    if (!organization) {
      return res
        .status(404)
        .json({ message: "Organization or user not found" });
    }

    // Update role in user's profile
    await User.findOneAndUpdate(
      {
        _id: userId,
        "organizations.organizationId": orgId,
      },
      {
        $set: { "organizations.$.role": role },
      }
    );

    res.json(organization);
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Failed to update user role" });
  }
};

// New controller for adding/removing members
const manageMembers = async (req, res) => {
  try {
    const { action } = req.body; // 'add' or 'remove'
    const { orgId, userId } = req.params;

    if (action === "add") {
      const { role } = req.body;

      // Add member to organization
      const organization = await Organization.findByIdAndUpdate(
        orgId,
        {
          $addToSet: {
            members: { userId, role },
          },
        },
        { new: true }
      );

      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Add organization to user's profile
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          organizations: {
            organizationId: orgId,
            role,
          },
        },
      });

      res.json(organization);
    } else if (action === "remove") {
      // Remove member from organization
      const organization = await Organization.findByIdAndUpdate(
        orgId,
        {
          $pull: {
            members: { userId },
          },
        },
        { new: true }
      );

      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Remove organization from user's profile
      await User.findByIdAndUpdate(userId, {
        $pull: {
          organizations: {
            organizationId: orgId,
          },
        },
      });

      res.json(organization);
    } else {
      res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    console.error("Error managing members:", error);
    res.status(500).json({ message: "Failed to manage members" });
  }
};

// get User's organizations 
const getUserOrganizations = async (req, res) => {
  try {

    const organizations = await Organization.find({ members: { $elemMatch: { userId: req.user._id } } });
    
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: "Failed to get user's organizations" });
  }
};

// export all controller functions
export {
  createOrganization,
  updateOrganization,
  deleteOrganization,
  updateUserRole,
  manageMembers,
  getUserOrganizations,
};
