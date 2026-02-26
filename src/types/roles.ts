export enum UserRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  FRAMEWORK_OWNER = 'FRAMEWORK_OWNER',
  CONTROLS_MANAGER = 'CONTROLS_MANAGER',
  CONTROL_OWNER = 'CONTROL_OWNER',
  REVIEWER = 'REVIEWER',
  BOARD_MEMBER = 'BOARD_MEMBER',
}

export enum Permission {
  // Effectiveness Criteria
  CONFIGURE_EFFECTIVENESS_CRITERIA = 'CONFIGURE_EFFECTIVENESS_CRITERIA',
  APPROVE_EFFECTIVENESS_CRITERIA = 'APPROVE_EFFECTIVENESS_CRITERIA',
  
  // Risk Management
  CREATE_PRINCIPAL_RISKS = 'CREATE_PRINCIPAL_RISKS',
  EDIT_PRINCIPAL_RISKS = 'EDIT_PRINCIPAL_RISKS',
  DELETE_PRINCIPAL_RISKS = 'DELETE_PRINCIPAL_RISKS',
  APPROVE_RISKS = 'APPROVE_RISKS',
  
  // Control Management
  CREATE_CONTROLS = 'CREATE_CONTROLS',
  EDIT_OWN_CONTROLS = 'EDIT_OWN_CONTROLS',
  EDIT_ALL_CONTROLS = 'EDIT_ALL_CONTROLS',
  DELETE_CONTROLS = 'DELETE_CONTROLS',
  ASSIGN_CONTROLS = 'ASSIGN_CONTROLS',
  
  // Evidence and Testing
  UPLOAD_EVIDENCE = 'UPLOAD_EVIDENCE',
  COMPLETE_TESTING = 'COMPLETE_TESTING',
  REVIEW_TESTING = 'REVIEW_TESTING',
  
  // Workflow
  SUBMIT_FOR_REVIEW = 'SUBMIT_FOR_REVIEW',
  APPROVE_SECTIONS = 'APPROVE_SECTIONS',
  BOARD_APPROVAL = 'BOARD_APPROVAL',
  LOCK_FRAMEWORK = 'LOCK_FRAMEWORK',
  CREATE_NEW_VERSION = 'CREATE_NEW_VERSION',
  
  // Collaboration
  ADD_COMMENTS = 'ADD_COMMENTS',
  RESOLVE_COMMENTS = 'RESOLVE_COMMENTS',
  
  // Reporting
  VIEW_AUDIT_TRAIL = 'VIEW_AUDIT_TRAIL',
  EXPORT_DATA = 'EXPORT_DATA',
  GENERATE_REPORTS = 'GENERATE_REPORTS',
  
  // User Management
  MANAGE_USERS = 'MANAGE_USERS',
  ASSIGN_ROLES = 'ASSIGN_ROLES',
  
  // System
  CONFIGURE_SYSTEM = 'CONFIGURE_SYSTEM',
  VIEW_ALL_DATA = 'VIEW_ALL_DATA',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SYSTEM_ADMIN]: [
    Permission.MANAGE_USERS,
    Permission.ASSIGN_ROLES,
    Permission.CONFIGURE_SYSTEM,
    Permission.VIEW_ALL_DATA,
    Permission.VIEW_AUDIT_TRAIL,
    Permission.EXPORT_DATA,
  ],
  
  [UserRole.FRAMEWORK_OWNER]: [
    Permission.CONFIGURE_EFFECTIVENESS_CRITERIA,
    Permission.APPROVE_EFFECTIVENESS_CRITERIA,
    Permission.CREATE_PRINCIPAL_RISKS,
    Permission.EDIT_PRINCIPAL_RISKS,
    Permission.DELETE_PRINCIPAL_RISKS,
    Permission.APPROVE_RISKS,
    Permission.CREATE_CONTROLS,
    Permission.EDIT_ALL_CONTROLS,
    Permission.DELETE_CONTROLS,
    Permission.ASSIGN_CONTROLS,
    Permission.UPLOAD_EVIDENCE,
    Permission.COMPLETE_TESTING,
    Permission.REVIEW_TESTING,
    Permission.SUBMIT_FOR_REVIEW,
    Permission.APPROVE_SECTIONS,
    Permission.BOARD_APPROVAL,
    Permission.LOCK_FRAMEWORK,
    Permission.CREATE_NEW_VERSION,
    Permission.ADD_COMMENTS,
    Permission.RESOLVE_COMMENTS,
    Permission.VIEW_AUDIT_TRAIL,
    Permission.EXPORT_DATA,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_ALL_DATA,
  ],
  
  [UserRole.CONTROLS_MANAGER]: [
    Permission.CREATE_PRINCIPAL_RISKS,
    Permission.EDIT_PRINCIPAL_RISKS,
    Permission.CREATE_CONTROLS,
    Permission.EDIT_ALL_CONTROLS,
    Permission.ASSIGN_CONTROLS,
    Permission.UPLOAD_EVIDENCE,
    Permission.COMPLETE_TESTING,
    Permission.REVIEW_TESTING,
    Permission.SUBMIT_FOR_REVIEW,
    Permission.ADD_COMMENTS,
    Permission.VIEW_AUDIT_TRAIL,
    Permission.EXPORT_DATA,
    Permission.GENERATE_REPORTS,
  ],
  
  [UserRole.CONTROL_OWNER]: [
    Permission.EDIT_OWN_CONTROLS,
    Permission.UPLOAD_EVIDENCE,
    Permission.COMPLETE_TESTING,
    Permission.ADD_COMMENTS,
  ],
  
  [UserRole.REVIEWER]: [
    Permission.ADD_COMMENTS,
    Permission.RESOLVE_COMMENTS,
    Permission.APPROVE_SECTIONS,
    Permission.VIEW_AUDIT_TRAIL,
    Permission.EXPORT_DATA,
  ],
  
  [UserRole.BOARD_MEMBER]: [
    Permission.BOARD_APPROVAL,
    Permission.VIEW_AUDIT_TRAIL,
    Permission.EXPORT_DATA,
  ],
};

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMIN]: 'System Administrator',
  [UserRole.FRAMEWORK_OWNER]: 'Framework Owner',
  [UserRole.CONTROLS_MANAGER]: 'Internal Controls Manager',
  [UserRole.CONTROL_OWNER]: 'Control Owner',
  [UserRole.REVIEWER]: 'Reviewer',
  [UserRole.BOARD_MEMBER]: 'Board Member',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMIN]: 'IT Admin or Platform Owner - Manages users and system configuration',
  [UserRole.FRAMEWORK_OWNER]: 'CFO or Head of Risk - Full control over the framework',
  [UserRole.CONTROLS_MANAGER]: 'Risk Manager or Compliance Officer - Manages risks and controls',
  [UserRole.CONTROL_OWNER]: 'Operational Manager - Owns and maintains specific controls',
  [UserRole.REVIEWER]: 'Senior Manager or Auditor - Reviews and approves content',
  [UserRole.BOARD_MEMBER]: 'Board or Audit Committee Member - Read-only access to approved content',
};
