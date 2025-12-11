export async function getUserPermissions(userId: string): Promise<{
  roleName?: string;
  permissions?: string[];
}> {
  // Mock implementation - replace with actual database lookup
  return {
    roleName: 'user',
    permissions: ['read', 'write']
  };
}