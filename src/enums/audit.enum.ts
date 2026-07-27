export enum AuditStatus {
    INFO = 'info',
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum AuditAction {
    CREATE_USER = 'create_user',
    UPDATE_USER = 'update_user',
    DELETE_USER = 'delete_user',
    UPDATE_SALARY = 'update_salary',
    ASSIGN_LEAD = 'assign_lead',
    // Add more as needed
}
