export const STUDENT_PFP_TEMPLATE = "/images/studentpfp-template/studentpfp-template.webp";

export const getGeneratedStudentAvatar = (_student: Record<string, unknown> = {}) => STUDENT_PFP_TEMPLATE;

export const ensureStudentAvatar = <T extends Record<string, unknown>>(student: T): T & { image: string } => ({
  ...student,
  image: typeof student.image === "string" && student.image.trim()
    ? student.image
    : getGeneratedStudentAvatar(student),
});
