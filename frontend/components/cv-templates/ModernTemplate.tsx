/**
 * Lansy.ai — Modern CV Template (React-PDF)
 * Two-column layout: sidebar (30%) + main (70%)
 */

'use client';

import {
  Document, Page, View, Text, StyleSheet, Font,
} from '@react-pdf/renderer';
import type { GeneratedCV, PersonalInfo } from '@/types';

const colors = {
  sidebar: '#1E3A5F',
  sidebarText: '#FFFFFF',
  sidebarAccent: '#7CB9E8',
  main: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#1E3A5F',
  border: '#E2E8F0',
};

const styles = StyleSheet.create({
  page: { flexDirection: 'row', fontFamily: 'Helvetica' },
  sidebar: { width: '30%', backgroundColor: colors.sidebar, padding: 20, color: colors.sidebarText },
  main: { width: '70%', padding: 25, backgroundColor: colors.main },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: colors.sidebarText },
  contactItem: { fontSize: 8, marginBottom: 4, opacity: 0.9 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8, paddingBottom: 3, borderBottomWidth: 1.5 },
  sidebarSectionTitle: { borderBottomColor: colors.sidebarAccent, color: colors.sidebarAccent },
  mainSectionTitle: { borderBottomColor: colors.accent, color: colors.accent },
  skillTag: { fontSize: 8, backgroundColor: 'rgba(255,255,255,0.15)', padding: '2 8', borderRadius: 10, marginRight: 4, marginBottom: 4 },
  langItem: { fontSize: 8, marginBottom: 4 },
  summary: { fontSize: 9, lineHeight: 1.5, color: colors.textSecondary, fontStyle: 'italic', marginBottom: 12 },
  entry: { marginBottom: 10 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  entryTitle: { fontSize: 10, fontWeight: 'bold', color: colors.text },
  entryDate: { fontSize: 8, color: '#888888' },
  entryCompany: { fontSize: 9, color: colors.accent, marginTop: 1, marginBottom: 3 },
  bulletPoint: { fontSize: 8, lineHeight: 1.4, color: colors.text, marginBottom: 2, paddingLeft: 8 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
});

interface ModernTemplateProps {
  cv: GeneratedCV;
  personalInfo: PersonalInfo;
}

export default function ModernTemplate({ cv, personalInfo }: ModernTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.name}>{personalInfo.name}</Text>

          {personalInfo.email && (
            <Text style={styles.contactItem}>📧 {personalInfo.email}</Text>
          )}
          {personalInfo.phone && (
            <Text style={styles.contactItem}>📱 {personalInfo.phone}</Text>
          )}
          {personalInfo.address && (
            <Text style={styles.contactItem}>📍 {personalInfo.address}</Text>
          )}
          {personalInfo.linkedin && (
            <Text style={styles.contactItem}>🔗 {personalInfo.linkedin}</Text>
          )}
          {personalInfo.github && (
            <Text style={styles.contactItem}>💻 {personalInfo.github}</Text>
          )}

          {/* Skills */}
          <Text style={[styles.sectionTitle, styles.sidebarSectionTitle]}>
            Compétences
          </Text>
          <View style={styles.skillsContainer}>
            {cv.technical_skills.map((skill, i) => (
              <Text key={i} style={styles.skillTag}>{skill}</Text>
            ))}
          </View>

          {/* Languages */}
          {cv.languages.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, styles.sidebarSectionTitle]}>
                Langues
              </Text>
              {cv.languages.map((lang, i) => (
                <Text key={i} style={styles.langItem}>
                  {lang.language} — {lang.level}
                </Text>
              ))}
            </>
          )}

          {/* Certifications */}
          {cv.certifications.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, styles.sidebarSectionTitle]}>
                Certifications
              </Text>
              {cv.certifications.map((cert, i) => (
                <Text key={i} style={styles.langItem}>• {cert}</Text>
              ))}
            </>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Professional Summary */}
          <Text style={[styles.sectionTitle, styles.mainSectionTitle]}>Profil</Text>
          <Text style={styles.summary}>{cv.professional_summary}</Text>

          {/* Experience */}
          <Text style={[styles.sectionTitle, styles.mainSectionTitle]}>Expérience</Text>
          {cv.experience.map((exp, i) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{exp.title}</Text>
                <Text style={styles.entryDate}>{exp.start_date} — {exp.end_date}</Text>
              </View>
              <Text style={styles.entryCompany}>{exp.company}</Text>
              {exp.bullet_points.map((bp, j) => (
                <Text key={j} style={styles.bulletPoint}>• {bp}</Text>
              ))}
            </View>
          ))}

          {/* Education */}
          <Text style={[styles.sectionTitle, styles.mainSectionTitle]}>Formation</Text>
          {cv.education.map((edu, i) => (
            <View key={i} style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{edu.degree}</Text>
                <Text style={styles.entryDate}>{edu.start_date} — {edu.end_date}</Text>
              </View>
              <Text style={styles.entryCompany}>{edu.institution}</Text>
              {edu.field && (
                <Text style={{ fontSize: 8, color: colors.textSecondary }}>{edu.field}</Text>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
