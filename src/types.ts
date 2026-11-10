// These are the ONLY fields written into each Firebase user record.
export type UserFields = {
  email: string;
  matkhau: string;
  hoten: string;
  hinhanh: string;
};

// The Firebase child key is UI metadata, never an additional database field.
export type UserEntry = { key: string; value: UserFields };
