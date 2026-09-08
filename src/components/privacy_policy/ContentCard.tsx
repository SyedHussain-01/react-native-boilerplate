import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppText from "../common/AppText";

type ContentCardProps = {
  content: string;
};

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  // Parse content to handle headings and paragraphs
  const parseContent = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactElement[] = [];
    let key = 0;
    let isFirstHeading = true;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (trimmedLine === "") {
        return;
      }

      // Check if line is a heading
      // Headings are typically:
      // - Short lines (less than 60 chars)
      // - Don't end with period
      // - Don't start with lowercase (unless it's a list item)
      // - Not preceded by a period in the previous line
      const isShort = trimmedLine.length < 60;
      const doesntEndWithPeriod = !trimmedLine.endsWith(".");
      const startsWithCapital = /^[A-Z]/.test(trimmedLine);
      const isListStart = /^[a-z]\)|^[0-9]+\.|^[-•]/.test(trimmedLine);
      const prevLine = index > 0 ? lines[index - 1].trim() : "";
      const prevEndsWithPeriod = prevLine.endsWith(".");
      
      const isHeading = 
        isShort && 
        doesntEndWithPeriod && 
        (startsWithCapital || isListStart) &&
        (prevEndsWithPeriod || isFirstHeading || prevLine === "");

      if (isHeading) {
        if (!isFirstHeading) {
          // Add spacing before heading (except first one)
          elements.push(<View key={`spacer-${key++}`} style={styles.spacer} />);
        }
        elements.push(
          <AppText
            key={key++}
            weight="Medium"
            size="base"
            style={styles.heading}
          >
            {trimmedLine}
          </AppText>
        );
        isFirstHeading = false;
      } else {
        elements.push(
          <AppText
            key={key++}
            weight="Regular"
            size="base"
            style={styles.paragraph}
          >
            {trimmedLine}
          </AppText>
        );
      }
    });

    return elements;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {parseContent(content)}
      </ScrollView>
    </View>
  );
};

export default ContentCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: "#E9EAEB",
    borderRadius: scale(16),
    padding: scale(16),
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
  },
  spacer: {
    height: verticalScale(8),
  },
  heading: {
    color: palette.contentTitle,
    marginBottom: verticalScale(8),
  },
  paragraph: {
    color: palette.contentBody,
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(20),
  },
});

