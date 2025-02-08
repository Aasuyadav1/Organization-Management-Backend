import Organization from "../models/organization-model.js";
import { User } from "../models/user-model.js";

// create organization
const createOrganization = async (req, res) => {
  try {
    const { name, description, logo } = req.body;

    console.log("create org", req.body)
    const organization = new Organization({
      name,
      description,
      logo,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "owner" }],
    });

    console.log("org created ", organization)

    await organization.save();

    // Update user's organizations
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        organizations: { organizationId: organization._id, role: "owner" },
      },
    });

    res.status(201).json(organization);
  } catch (error) {
    console.log("error on creation0", error)
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

    // Validate role
    const validRoles = ["owner", "admin", "member"];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Prevent changing owner's role
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (organization.owner.toString() === userId && role !== "owner") {
      return res.status(403).json({ message: "Cannot change organization owner's role" });
    }

    // Update role in organization
    const updatedOrg = await Organization.findOneAndUpdate(
      {
        _id: orgId,
        "members.user": userId,
      },
      {
        $set: { "members.$.role": role.toLowerCase() },
      },
      { new: true }
    );

    if (!updatedOrg) {
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
        $set: { "organizations.$.role": role.toLowerCase() },
      }
    );

    res.json(updatedOrg);
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

      // Validate role
      const validRoles = ["owner", "admin", "member"];
      if (!validRoles.includes(role.toLowerCase())) {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      // Check if user is already a member
      const existingOrg = await Organization.findOne({
        _id: orgId,
        'members.user': userId
      });

      if (existingOrg) {
        return res.status(400).json({ message: "User is already a member of this organization" });
      }

      // Add member to organization
      const organization = await Organization.findByIdAndUpdate(
        orgId,
        {
          $addToSet: {
            members: { user: userId, role: role.toLowerCase() },
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
            role: role.toLowerCase(),
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
            members: { user: userId },
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

    console.log("user id form get org", req.user)

    const organizations = await Organization.find({ 'members.user': req.user._id });

    console.log("organizations data getting ", organizations)
    
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: "Failed to get user's organizations" });
  }
};

// get organization all member by orgid 
export const getOrganizationMembers = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const userId = req.user._id;

        const organization = await Organization.findById(organizationId)
            .populate({
                path: 'members.user',
                model: 'User',
                select: 'name email profilePicture'
            });

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Check if the requesting user is a member of the organization
        const userMembership = organization.members.find(
            member => member.user._id.toString() === userId.toString()
        );

        if (!userMembership) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this organization'
            });
        }

        // Format the response data
        const members = organization.members.map(member => ({
            userId: member.user._id,
            name: member.user.name,
            email: member.user.email,
            profilePicture: member.user.profilePicture,
            role: member.role
        }));

        return res.status(200).json({
            success: true,
            data: members
        });

    } catch (error) {
        console.error('Error in getOrganizationMembers:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
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
