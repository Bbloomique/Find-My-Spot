import { FC, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Define a single turn step
export interface Step {
  instruction: string;
  distance: number; // in kilometers
}

// Define the props for the TurnByTurnPanel
interface TurnByTurnPanelProps {
  gateId: string;  // Expecting a string prop 'gateId'
}

const TurnByTurnPanel: FC<TurnByTurnPanelProps> = ({ gateId }) => {
  // Gate 1 specific substeps (More accurate steps)
  const gate1Steps: Step[] = [
    { instruction: 'Start at Gate 1 entrance', distance: 0 },
    { instruction: 'Turn left onto Gate 1 Rd', distance: 0.05 },
    { instruction: 'Continue straight for 150 meters', distance: 0.15 },
    { instruction: 'Turn left at the traffic light', distance: 0.08 },
    { instruction: 'Continue straight towards Exit A', distance: 0.1 },
    { instruction: 'You have arrived at your destination', distance: 0 },
  ];

  // Gate 2 specific substeps (More accurate steps)
  const gate2Steps: Step[] = [
    { instruction: 'Start at Gate 2 entrance', distance: 0 },
    { instruction: 'Turn right onto Gate 2 Rd', distance: 0.05 },
    { instruction: 'Continue straight for 456 meters', distance: 0.456 },
    { instruction: 'Turn left towards Exit B', distance: 0.56 },
    { instruction: 'Continue straight towards Exit B', distance: 0.12 },
    { instruction: 'You have arrived at your destination', distance: 0 },
  ];

  // Determine steps based on gateId
  const steps = gateId === '1' ? gate1Steps : gate2Steps;

  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!steps.length) return null;
  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  let arrowIcon: string = 'navigation';
  const inst = step.instruction.toLowerCase();
  if (inst.includes('left')) arrowIcon = 'turn-left';
  else if (inst.includes('right')) arrowIcon = 'turn-right';
  else if (inst.includes('continue')) arrowIcon = 'straight';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.progressContainer}>
        {steps.map((_, idx) => (
          <View key={idx} style={[styles.dot, idx === currentStep && styles.activeDot]} />
        ))}
      </View>

      <Icon name={arrowIcon} size={48} color="#fff" style={styles.turnIcon} />

      <Text style={styles.instruction}>{step.instruction}</Text>
      <Text style={styles.distance}>{(step.distance * 1000).toFixed(0)} m</Text>

      <View style={styles.controls}>
        <TouchableOpacity disabled={isFirst} onPress={handlePrev} style={styles.controlBtn}>
          <Icon name="chevron-left" size={32} color={isFirst ? 'rgba(255,255,255,0.5)' : '#fff'} />
        </TouchableOpacity>

        <TouchableOpacity disabled={isLast} onPress={handleNext} style={styles.controlBtn}>
          <Icon name="chevron-right" size={32} color={isLast ? 'rgba(255,255,255,0.5)' : '#fff'} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    padding: 20,
    backgroundColor: '#0072ff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
  },
  turnIcon: {
    marginVertical: 12,
  },
  instruction: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  distance: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
  },
  controlBtn: {
    padding: 8,
  },
});

export default TurnByTurnPanel;