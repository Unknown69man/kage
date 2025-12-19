export interface VaultFile {
  id: string;
  name: string;
  type: "file" | "folder" | string;
  size: string;
  date?: string;
  dataUrl?: string;
  sourceUrl?: string;
}

export const VAULT_TEST_FILES: VaultFile[] = [
  {
    id: "vault-1",
    name: "Secret_Project_2025.pdf",
    type: "file",
    size: "2.4 MB",
    date: "Dec 15, 2025"
  },
  {
    id: "vault-2",
    name: "Private_Notes.txt",
    type: "file",
    size: "145 KB",
    date: "Dec 14, 2025"
  },
  {
    id: "vault-3",
    name: "Confidential_Folder",
    type: "folder",
    size: "8 items",
    date: "Dec 12, 2025"
  },
  {
    id: "vault-4",
    name: "Archive_2024.zip",
    type: "file",
    size: "156 MB",
    date: "Dec 1, 2025"
  }
];
