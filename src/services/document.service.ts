import { prisma } from "@/lib/prisma";

export class DocumentService {
  static async getDocuments(
    organizationId: string,
    categoryId?: string,
    search?: string
  ) {
    return await prisma.document.findMany({
      where: {
        organizationId,
        categoryId: categoryId || undefined,
        OR: search
          ? [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async getDocumentById(id: string, organizationId: string) {
    return await prisma.document.findFirst({
      where: { id, organizationId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        versions: {
          orderBy: { version: "desc" },
          take: 10,
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async createDocument(
    data: {
      title: string;
      content?: string;
      categoryId?: string | null;
      isPublished?: boolean;
      createdById: string;
    },
    organizationId: string
  ) {
    const doc = await prisma.document.create({
      data: {
        title: data.title,
        content: data.content || null,
        categoryId: data.categoryId || null,
        isPublished: data.isPublished || false,
        organizationId,
        createdById: data.createdById,
      },
    });

    // Create initial version
    if (data.content) {
      await prisma.documentVersion.create({
        data: {
          version: 1,
          content: data.content,
          documentId: doc.id,
        },
      });
    }

    return doc;
  }

  static async updateDocument(
    id: string,
    data: {
      title?: string;
      content?: string;
      categoryId?: string | null;
      isPublished?: boolean;
    },
    organizationId: string
  ) {
    const doc = await prisma.document.findFirst({
      where: { id, organizationId },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });

    if (!doc) throw new Error("Document not found");

    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
        isPublished: data.isPublished,
      },
    });

    // If content changed, create new version
    if (data.content !== undefined && data.content !== doc.content) {
      const nextVersionNum = doc.versions.length > 0 ? doc.versions[0].version + 1 : 1;
      await prisma.documentVersion.create({
        data: {
          version: nextVersionNum,
          content: data.content,
          documentId: id,
        },
      });
    }

    return updatedDoc;
  }

  static async deleteDocument(id: string, organizationId: string) {
    const doc = await prisma.document.findFirst({
      where: { id, organizationId },
    });

    if (!doc) throw new Error("Document not found");

    return await prisma.document.delete({
      where: { id },
    });
  }

  // Categories helper
  static async getCategories(organizationId: string) {
    return await prisma.category.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });
  }

  static async createCategory(
    data: { name: string; color?: string },
    organizationId: string
  ) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return await prisma.category.create({
      data: {
        name: data.name,
        slug,
        color: data.color || "#6366f1",
        organizationId,
      },
    });
  }
}
