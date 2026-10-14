export const getStudentInitials = (student) => {
  const firstInitial = String(student?.fname || '').trim().charAt(0);
  const lastInitial = String(student?.lname || '').trim().charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase() || 'S';
};
