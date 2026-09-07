import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppText from "./AppText";

type FAQItemProps = {
  question: string;
  answer: string;
  isExpanded?: boolean;
  onToggle?: () => void;
};

const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,
  isExpanded = false,
  onToggle,
}) => {
  const [expanded, setExpanded] = useState(isExpanded);

  const handleToggle = () => {
    setExpanded(!expanded);
    onToggle?.();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.questionContainer}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <AppText
          weight={expanded ? "Medium" : "Regular"}
          size="base"
          style={styles.question}
        >
          {question}
        </AppText>
        <Feather
          name={expanded ? "chevron-down" : "chevron-right"}
          size={moderateScale(20)}
          color={palette.contentTitle}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.answerContainer}>
          <AppText weight="Regular" size="base" style={styles.answer}>
            {answer}
          </AppText>
        </View>
      )}
    </View>
  );
};

export default FAQItem;

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(12),
    marginBottom: verticalScale(16),
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  question: {
    flex: 1,
    color: palette.contentTitle,
  },
  answerContainer: {
    marginTop: verticalScale(0),
  },
  answer: {
    color: palette.contentBody,
    lineHeight: moderateScale(20),
  },
});

