
export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

export const SESSION_COOKIE_NAME = 'sbs_admin_session';


export function isAuthDisabled(): boolean {
  return process.env.DISABLE_AUTH === 'true';
}
