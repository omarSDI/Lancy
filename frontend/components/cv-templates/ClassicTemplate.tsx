/**
 * Lansy.ai — Classic CV Template (React-PDF)
 * Single column, traditional layout with serif-inspired headings.
 */

'use client';

import {
  Document, Page, View, Text, StyleSheet,
} from '@react-pdf/renderer';
import type { GeneratedCV, PersonalInfo } from '@/types';

const styles = StyleSheet.create({
  page: { padding: '25mm 30mm', fontFamily: 'Times-Roman', fontSize: 10, color: '#222' },
  header: { textAlign: 'center', borderBottomWidth: 2, borderBottomColor: '#333', paddingBottom: 10, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: 'bold', letterSpacing: 2, fontFamily: 'Times-Bold' },
  contact: { fontSize: 8, color: '#555', marginTop: 5 },
  sectionTitle: {
    fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5,
    borderBottomWidth: 0.5, borderBottomColor: '#999', paddingBottom: 3,
    marginTop: 14, marginBottom: 8, color: '#333', fontFamily: 'Times-Bold',
  },
  summary: { fontSize: 9, lineHeight: 1.6, color: '#444', marginBottom: 8 },
  entry: { marginBottom: 10 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  entryTitle: { fontSize: 10, fontWeight: 'bold', fontFamily: 'Times-Bold' },
  date: { fontSize: 8, color: '#777', fontStyle: 'italic' },
  field: { fontSize: 8, color: '#666', marginTop: 2 },
  bulletPoint: { fontSize: 9, marginBottom: 2, paddingLeft: 10, lineHeight: 1.4 },
  skillsLine: { fontSize: 9, marginBottom: 3 },
  bold: { fontFamily: 'Times-Bold' },
});

interface ClassicTemplateProps {
  cv: GeneratedCV;
  personalInfo: PersonalInfo;
}

export default function ClassicTemplate({ cv, personalInfo }: ClassicTemplateProps) {
  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.address,
    personalInfo.linkedin,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{personalInfo.name}</Text>
          <Text style={styles.contact}>{contactParts.join(' | ')}</Text>
        </View>

        {/* Summary */}
        <Text style={styles.sectionTitle}>Profil Professionnel</Text>
        <Text style={styles.summary}>{cv.professional_summary}</Text>

        {/* Experience */}
        <Text style={styles.sectionTitle}>Expérience Professionnelle</Text>
        {cv.experience.map((exp, i) => (
          <View key={i} style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryTitle}>
                {exp.title} — {exp.company}
              </Text>
              <Text style={styles.date}>
                {exp.start_date} — {exp.end_date}
              </Text>
            </View>
            {exp.bullet_points.map((bp, j) => (
              <Text key={j} style={styles.bulletPoint}>• {bp}</Text>
            ))}
          </View>
        ))}

        {/* Education */}
        <Text style={styles.sectionTitle}>Formation</Text>
        {cv.education.map((edu, i) => (
          <View key={i} style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryTitle}>
                {edu.degree} — {edu.institution}
              </Text>
              <Text style={styles.date}>
                {edu.start_date} — {edu.end_date}
              </Text>
            </View>
            {edu.field && <Text style={styles.field}>{edu.field}</Text>}
          </View>
        ))}

        {/* Skills */}
        <Text style={styles.sectionTitle}>Compétences</Text>
        <Text style={styles.skillsLine}>
          <Text style={styles.bold}>Techniques: </Text>
          {cv.technical_skills.join(', ')}
        </Text>
        {cv.soft_skills.length > 0 && (
          <Text style={styles.skillsLine}>
            <Text style={styles.bold}>Interpersonnelles: </Text>
            {cv.soft_skills.join(', ')}
          </Text>
        )}

        {/* Languages */}
        {cv.languages.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Langues</Text>
            <Text style={styles.skillsLine}>
              {cv.languages.map((l) => `${l.language} (${l.level})`).join(', ')}
            </Text>
          </>
        )}

        {/* Certifications */}
        {cv.certifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <Text style={styles.skillsLine}>
              {cv.certifications.join(', ')}
            </Text>
          </>
        )}
      </Page>
    </Document>
  );
}
