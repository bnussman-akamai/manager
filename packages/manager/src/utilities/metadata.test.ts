import { utoa } from './metadata';

/**
 * This is an example cloud-init config
 */
export const userData = `#cloud-config
package_update: true
package_upgrade: true
packages:
- nginx
- mysql-server
`;

/**
 * This is the base64 encoded version of `userData`.
 * It was generated by base64 --break=0 --input=[file name here]
 */
export const base64UserData =
  'I2Nsb3VkLWNvbmZpZwpwYWNrYWdlX3VwZGF0ZTogdHJ1ZQpwYWNrYWdlX3VwZ3JhZGU6IHRydWUKcGFja2FnZXM6Ci0gbmdpbngKLSBteXNxbC1zZXJ2ZXIK';

describe('utoa', () => {
  it('should produce base64 encoded user data', () => {
    expect(utoa(userData)).toBe(base64UserData);
  });
});