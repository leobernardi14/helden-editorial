import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { Post } from '@/lib/types'
import { LOGO_HELDEN_ESCURO_BASE64 } from './logoBase64'

const postTypeLabels: Record<string, string> = {
  feed: 'Feed', story: 'Story', reels: 'Reels', carrossel: 'Carrossel',
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#171717',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 12,
    marginBottom: 18,
  },
  logo: {
    width: 80,
    height: 32,
  },
  headerInfo: {
    alignItems: 'flex-end',
  },
  clientName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 2,
  },
  calendarTitle: {
    fontSize: 10,
    color: '#525252',
    marginBottom: 2,
  },
  genDate: {
    fontSize: 8,
    color: '#a3a3a3',
  },
  postCard: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  postNumber: {
    fontSize: 11,
    fontWeight: 700,
  },
  postTypeBadge: {
    fontSize: 8,
    backgroundColor: '#f4f4f4',
    color: '#525252',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  postDate: {
    fontSize: 8,
    color: '#a3a3a3',
  },
  approvedBadge: {
    fontSize: 8,
    fontWeight: 700,
    backgroundColor: '#dcfce7',
    color: '#15803d',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  sectionBlock: {
    marginBottom: 0,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#60a5fa',
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  sectionLabelCopy: { color: '#1d4ed8' },
  sectionText: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    textAlign: 'center',
    fontSize: 7,
    color: '#a3a3a3',
  },
})

export interface CopysPdfPost {
  position: number
  post_type: Post['post_type']
  scheduled_date: Post['scheduled_date']
  copy_text: string
}

export function CopysPdfDocument({
  clientName,
  calendarTitle,
  referenceMonth,
  posts,
}: {
  clientName: string
  calendarTitle: string
  referenceMonth: string | null
  posts: CopysPdfPost[]
}) {
  const generatedAt = new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={`data:image/png;base64,${LOGO_HELDEN_ESCURO_BASE64}`} />
          <View style={styles.headerInfo}>
            <Text style={styles.clientName}>{clientName}</Text>
            <Text style={styles.calendarTitle}>
              {calendarTitle}{referenceMonth ? ` · ${referenceMonth}` : ''}
            </Text>
            <Text style={styles.genDate}>Gerado em {generatedAt}</Text>
          </View>
        </View>

        {posts.map((post) => (
          <View key={post.position} style={styles.postCard} wrap={false}>
            <View style={styles.postHeaderRow}>
              <Text style={styles.postNumber}>#{post.position}</Text>
              {post.post_type && (
                <Text style={styles.postTypeBadge}>{postTypeLabels[post.post_type] ?? post.post_type}</Text>
              )}
              {post.scheduled_date && (
                <Text style={styles.postDate}>
                  {new Date(post.scheduled_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </Text>
              )}
              <Text style={styles.approvedBadge}>✓ Copy aprovada</Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionLabel, styles.sectionLabelCopy]}>Copy da arte</Text>
              <Text style={styles.sectionText}>{post.copy_text || '—'}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Helden · Página ${pageNumber} de ${totalPages}`} />
      </Page>
    </Document>
  )
}
