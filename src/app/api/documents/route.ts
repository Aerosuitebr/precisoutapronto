import { NextResponse } from 'next/server';
import { getValidSessionFromCookies } from '@/lib/auth/user-session';
import { getPrisma, isDatabaseConfigured } from '@/lib/db';
import {
  buildDocumentEditorHref,
  DOCUMENT_HISTORY_TOOL_IDS,
  getDocumentHistoryTitle,
  getDocumentHistoryTool
} from '@/lib/document-history';

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
    }
    const session = await getValidSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

    const rows = await getPrisma().toolDocument.findMany({
      where: {
        userId: session.sub,
        toolId: { in: DOCUMENT_HISTORY_TOOL_IDS }
      },
      select: {
        artifactId: true,
        toolId: true,
        data: true,
        isFavorite: true,
        updatedAt: true
      },
      orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
      take: 50
    });

    const documents = rows.flatMap((row) => {
      const tool = getDocumentHistoryTool(row.toolId);
      const editorHref = buildDocumentEditorHref(row.toolId, row.artifactId);
      if (!tool || !editorHref) return [];
      return [{
        artifactId: row.artifactId,
        toolId: row.toolId,
        title: getDocumentHistoryTitle(row.data, tool.label),
        updatedAt: row.updatedAt.toISOString(),
        isFavorite: row.isFavorite,
        editorHref,
        toolLabel: tool.label
      }];
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('[documents:history]', error);
    return NextResponse.json({ error: 'Could not load document history.' }, { status: 500 });
  }
}
