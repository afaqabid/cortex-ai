import { prisma } from "@/lib/prisma";

export class FileService {
  static async getFiles(organizationId: string, folderId: string | null = null) {
    return await prisma.file.findMany({
      where: {
        organizationId,
        folderId: folderId || null,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getFolders(organizationId: string, parentId: string | null = null) {
    return await prisma.folder.findMany({
      where: {
        organizationId,
        parentId: parentId || null,
      },
      orderBy: { name: "asc" },
    });
  }

  static async createFolder(
    name: string,
    parentId: string | null,
    organizationId: string
  ) {
    return await prisma.folder.create({
      data: {
        name,
        parentId: parentId || null,
        organizationId,
      },
    });
  }

  static async createFile(
    data: {
      name: string;
      url: string;
      size: number;
      mimeType: string;
      folderId: string | null;
      uploadedById: string;
    },
    organizationId: string
  ) {
    return await prisma.file.create({
      data: {
        name: data.name,
        url: data.url,
        size: data.size,
        mimeType: data.mimeType,
        folderId: data.folderId || null,
        organizationId,
        uploadedById: data.uploadedById,
      },
    });
  }

  static async deleteFile(id: string, organizationId: string) {
    const file = await prisma.file.findFirst({
      where: { id, organizationId },
    });

    if (!file) throw new Error("File not found");

    // Optional: we can delete the local physical file here too.
    // For simplicity, we just delete the DB record.
    return await prisma.file.delete({
      where: { id },
    });
  }

  static async deleteFolder(id: string, organizationId: string) {
    const folder = await prisma.folder.findFirst({
      where: { id, organizationId },
    });

    if (!folder) throw new Error("Folder not found");

    return await prisma.folder.delete({
      where: { id },
    });
  }
}
