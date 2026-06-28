/**
 * Lansy.ai — Minimal CV Template (React-PDF)
 * Full white, maximum whitespace, tech/startup aesthetic.
 */

'use client';

import {
  Document, Page, View, Text, StyleSheet,
} from '@react-pdf/renderer';
import type { GeneratedCV, PersonalInfo } from '@/types';

const styles = StyleSheet.create({
  page: { padding: '25mm 30mm', fontFamily: 'Helvetica', fontSize: 9, color: '#333' },
  name: { fontSize: 24, fontWeight: 'ultralight', letterSpacing: -0.5, marginBottom: 6 },
  contact: { fontSize: 8, color: '#888', marginBottom: 24 },
  sectionLabel: {
    fontSize: 8, textTransform: 'uppercase', letterSpacing: 2,
    color: '#AAAAAA', marginTop: 20, marginBottom: 10, fontWeight: 'bold',
  },
  summary: { fontSize: 9.5, lineHeight: 1.6, color: '#555', marginBottom: 8 },
  entry: { flexDirection: 'row', marginBottom: 12, gap: 16 },
  dateLabel: { width: 90, fontSize: 8, color: '#999', paddingTop: 2 },
  content: { flex: 1, fontSize: 9, lineHeight: 1.5 },
  entryTitle: { fontWeight: 'bold', fontFamily: 'Helvetica-Bold' },
  bullet: { color: '#666', marginBottom: 2, fontSize: 8.5 },
  skills: { fontSize: 9, color: '#555', lineHeight: 1.8 },
});

interface MinimalTemplateProps {
  cv: GeneratedCV;
  personalInfo: PersonalInfo;
}

export default function MinimalTemplate({ cv, personalInfo }: MinimalTemplateProps) {
  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.github,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Name & Contact */}
        <Text style={styles.name}>{personalInfo.name}</Text>
        <Text style={styles.contact}>{contactParts.join(' · ')}</Text>

        {/* Summary */}
        <Text style={styles.sectionLabel}>Profil</Text>
        <Text style={styles.summary}>{cv.professional_summary}</Text>

        {/* Experience */}
        <Text style={styles.sectionLabel}>Expérience</Text>
        {cv.experience.map((exp, i) => (
          <View key={i} style={styles.entry}>
            <Text style={styles.dateLabel}>
              {exp.start_date} —{'\n'}{exp.end_date}
            </Text>
            <View style={styles.content}>
              <Text>
                <Text style={styles.entryTitle}>{exp.title}</Text>
                {' · '}{exp.company}
              </Text>
              {exp.bullet_points.map((bp, j) => (
                <Text key={j} style={styles.bullet}>→ {bp}</Text>
              ))}
            </View>
          </View>
        ))}

        {/* Education */}
        <Text style={styles.sectionLabel}>Formation</Text>
        {cv.education.map((edu, i) => (
          <View key={i} style={styles.entry}>
            <Text style={styles.dateLabel}>
              {edu.start_date} —{'\n'}{edu.end_date}
            </Text>
            <View style={styles.content}>
              <Text>
                <Text style={styles.entryTitle}>{edu.degree}</Text>
                {' · '}{edu.institution}
              </Text>
              {edu.field && <Text style={styles.bullet}>→ {edu.field}</Text>}
            </View>
          </View>
        ))}

        {/* Skills */}
        <Text style={styles.sectionLabel}>Compétences</Text>
        <Text style={styles.skills}>
          {cv.technical_skills.join(' · ')}
        </Text>

        {/* Languages */}
        {cv.languages.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Langues</Text>
            <Text style={styles.skills}>
              {cv.languages.map((l) => `${l.language} (${l.level})`).join(' · ')}
            </Text>
          </>
        )}
      </Page>
    </Document>
  );
}
