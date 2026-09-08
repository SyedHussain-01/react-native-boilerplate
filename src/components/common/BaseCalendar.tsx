import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { palette } from "../../theme";
import AppText from "./AppText";

type BaseCalendarProps = {
  markedDates?: Record<string, any>;
  onDayPress?: (day: DateData) => void;
  onMonthChange?: (month: DateData) => void;
  renderDayComponent?: (props: { date?: DateData; state?: string }) => React.ReactElement | null;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  containerBackgroundColor?: string;
  firstDay?: number;
  currentMonth?: Date;
};

const BaseCalendar: React.FC<BaseCalendarProps> = ({
  markedDates = {},
  onDayPress,
  onMonthChange,
  renderDayComponent,
  headerBackgroundColor = "#FAF2EB",
  headerTextColor = palette.contentBody,
  containerBackgroundColor = "#FAFAFA",
  firstDay = 0,
  currentMonth: externalCurrentMonth,
}) => {
  const [internalCurrentMonth, setInternalCurrentMonth] = useState(new Date());
  
  // Use externalCurrentMonth if provided, otherwise use internal state
  const currentMonth = externalCurrentMonth || internalCurrentMonth;

  // Sync internal currentMonth with externalCurrentMonth when it changes
  useEffect(() => {
    if (externalCurrentMonth) {
      const externalMonth = new Date(
        externalCurrentMonth.getFullYear(),
        externalCurrentMonth.getMonth(),
        1
      );
      const internalMonth = new Date(
        internalCurrentMonth.getFullYear(),
        internalCurrentMonth.getMonth(),
        1
      );
      
      if (
        externalMonth.getMonth() !== internalMonth.getMonth() ||
        externalMonth.getFullYear() !== internalMonth.getFullYear()
      ) {
        setInternalCurrentMonth(externalMonth);
      }
    }
  }, [externalCurrentMonth]);

  // Sync internal currentMonth with markedDates when they change (only if no external month)
  useEffect(() => {
    const markedDatesKeys = Object.keys(markedDates);
    if (markedDatesKeys.length > 0 && !externalCurrentMonth) {
      const firstDate = markedDatesKeys[0];
      const [year, month] = firstDate.split("-").map(Number);
      const newMonth = new Date(year, month - 1, 1);
      
      setInternalCurrentMonth((prevMonth) => {
        if (
          newMonth.getMonth() !== prevMonth.getMonth() ||
          newMonth.getFullYear() !== prevMonth.getFullYear()
        ) {
          return newMonth;
        }
        return prevMonth;
      });
    }
  }, [markedDates, externalCurrentMonth]);

  const handleMonthChange = (month: DateData) => {
    const newMonth = new Date(month.year, month.month - 1, 1);
    if (!externalCurrentMonth) {
      setInternalCurrentMonth(newMonth);
    }
    onMonthChange?.(month);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const currentMonthName = monthNames[currentMonth.getMonth()];
  const currentYear = currentMonth.getFullYear();

  // Helper function to format date as YYYY-MM-DD using local time (not UTC)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Create a key that includes month for remounting, and markedDates keys for updating when returning to same month
  const markedDatesKeys = Object.keys(markedDates);
  const markedDatesSignature = markedDatesKeys.length > 0 
    ? markedDatesKeys.sort().slice(0, 5).join('') 
    : 'empty';
  const calendarKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${markedDatesSignature.substring(0, 20)}`;

  return (
    <View style={[styles.container, { backgroundColor: containerBackgroundColor, borderWidth: 0, borderRadius: 0 }]}>
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
        <TouchableOpacity
          onPress={() => {
            const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
            handleMonthChange({
              month: prevMonth.getMonth() + 1,
              year: prevMonth.getFullYear(),
              day: 1,
              timestamp: prevMonth.getTime(),
              dateString: formatLocalDate(prevMonth),
            });
          }}
          style={styles.arrowButton}
        >
          <Feather name="chevron-left" size={moderateScale(16)} color={palette.textDark} />
        </TouchableOpacity>
        <View style={[styles.monthYearContainer, { backgroundColor: headerBackgroundColor }]}>
          <AppText 
            weight="SemiBold" 
            size="base" 
            style={StyleSheet.flatten([styles.monthYearText, { color: headerTextColor }])}
          >
            {currentMonthName} {currentYear}
          </AppText>
        </View>
        <TouchableOpacity
          onPress={() => {
            const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
            handleMonthChange({
              month: nextMonth.getMonth() + 1,
              year: nextMonth.getFullYear(),
              day: 1,
              timestamp: nextMonth.getTime(),
              dateString: formatLocalDate(nextMonth),
            });
          }}
          style={styles.arrowButton}
        >
          <Feather name="chevron-right" size={moderateScale(16)} color={palette.textDark} />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <Calendar
        key={calendarKey}
        current={formatLocalDate(currentMonth)}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
        onDayPress={onDayPress}
        hideExtraDays
        firstDay={firstDay}
        enableSwipeMonths
        hideArrows
        renderHeader={() => null}
        style={styles.calendar}
        theme={{
          backgroundColor: containerBackgroundColor,
          calendarBackground: containerBackgroundColor,
          textSectionTitleColor: "#717680",
          selectedDayBackgroundColor: "transparent",
          selectedDayTextColor: palette.textDark,
          todayTextColor: palette.textDark,
          dayTextColor: palette.textDark,
          textDisabledColor: "#A4A7AE",
          dotColor: "transparent",
          selectedDotColor: "transparent",
          arrowColor: palette.textDark,
          monthTextColor: palette.textDark,
          textDayFontFamily: "PlusJakartaSans-Medium",
          textMonthFontFamily: "PlusJakartaSans-SemiBold",
          textDayHeaderFontFamily: "PlusJakartaSans-SemiBold",
          textDayFontSize: moderateScale(16),
          textMonthFontSize: moderateScale(16),
          textDayHeaderFontSize: moderateScale(14),
        } as any}
        dayComponent={renderDayComponent}
      />
    </View>
  );
};

export default BaseCalendar;

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: "#EAEBEB",
    overflow: "hidden",
    borderBottomLeftRadius: scale(16),
    backgroundColor: '#FAFAFA'
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: verticalScale(44),
    paddingHorizontal: scale(16),
    borderTopLeftRadius: scale(16),
    borderTopRightRadius: scale(16),
  },
  arrowButton: {
    width: moderateScale(24),
    height: moderateScale(24),
    justifyContent: "center",
    alignItems: "center",
  },
  monthYearContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
  },
  monthYearText: {
    fontSize: moderateScale(16),
  },
  calendar: {
    paddingBottom: verticalScale(16),
    borderBottomLeftRadius: scale(16),
    borderBottomRightRadius: scale(16),
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftColor: "#E9EAEB",
    borderRightColor: "#E9EAEB",
    borderBottomColor: "#E9EAEB",
  }
});

