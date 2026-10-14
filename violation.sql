-- Insert missing categories and fill blank fields in the existing `violations` table.
-- Existing non-blank description, type, severity, and default_sanction values are preserved.
-- Run this whole script in the same database session.
SET NAMES utf8mb4;

START TRANSACTION;

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Uniform not worn or worn improperly', 'Student did not follow the proper uniform guidelines.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Uniform not worn or worn improperly'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'School ID not worn properly', 'Student failed to wear or display their ID as required.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('School ID not worn properly'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Playing non-educational games', 'Student used devices to play games unrelated to schoolwork.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Playing non-educational games'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Sleeping during class or activities', 'Student was caught sleeping during lessons or activities.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Sleeping during class or activities'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Borrowing or lending money', 'Student engaged in borrowing or lending money on campus.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Borrowing or lending money'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Loitering or shouting in hallways', 'Student caused disturbance by roaming or shouting in hallways.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Loitering or shouting in hallways'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Leaving classroom messy', 'Student did not clean up their area or left trash behind.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Leaving classroom messy'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Use of mobile gadgets without permission', 'Student used a mobile device without teacher authorization.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Use of mobile gadgets without permission'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Excessive jewelry or inappropriate appearance', 'Student wore accessories not allowed by the dress code.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Excessive jewelry or inappropriate appearance'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Wearing inappropriate clothing', 'Student wore attire that is not allowed in school.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Wearing inappropriate clothing'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Using vulgar language', 'Student used inappropriate or offensive language.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Using vulgar language'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Minor bullying or teasing', 'Student engaged in light bullying, teasing, or mockery.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Minor bullying or teasing'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Fighting or causing disturbances', 'Student caused minor physical or verbal disturbances.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Fighting or causing disturbances'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Horseplay inside classroom', 'Student participated in rough or playful actions inside class.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Horseplay inside classroom'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Making inappropriate jokes', 'Student shared jokes that were inappropriate or offensive.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Making inappropriate jokes'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Not completing clearance requirements', 'Student failed to accomplish clearance tasks on time.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Not completing clearance requirements'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Taking food without consent', 'Student took food items without permission from the owner.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Taking food without consent'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Not joining required school activities', 'Student refused to join mandatory school events.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Not joining required school activities'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Chewing gum or spitting in public', 'Student chewed gum or spat in prohibited areas.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Chewing gum or spitting in public'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Buying food during class hours', 'Student left class or bought food when not allowed.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Buying food during class hours'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Using school properties without permission', 'Student used school equipment without approval.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Using school properties without permission'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Forging parent''s signature', 'Student wrote a fake parent or guardian signature.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Forging parent''s signature'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Misbehavior in the canteen', 'Student acted disruptively in the school canteen.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Misbehavior in the canteen'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Disturbing class sessions', 'Student interrupted or distracted ongoing classes.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Disturbing class sessions'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Unauthorized playing in the gym', 'Student used the gym facilities without permission.', 'Minor', 'Minor', '1st Offense: Written Reprimand'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Unauthorized playing in the gym'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Cheating or academic dishonesty', 'Student engaged in cheating or dishonest academic practices.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Cheating or academic dishonesty'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Plagiarism', 'Student submitted work copied from others without credit.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Plagiarism'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Rough or dangerous play', 'Student engaged in actions that could harm others.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Rough or dangerous play'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Lying or misleading statements', 'Student intentionally gave false or misleading information.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Lying or misleading statements'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Possession of smoking items', 'Student possessed cigarettes, vapes, or related items.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Possession of smoking items'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Vulgar or malicious acts', 'Student committed vulgar or offensive acts towards others.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Vulgar or malicious acts'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Bribery or dishonest acts', 'Student attempted to bribe or engage in dishonest conduct.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Bribery or dishonest acts'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Theft or aiding theft', 'Student stole or helped others steal property.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Theft or aiding theft'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Gambling or unauthorized collection', 'Student participated in gambling or unapproved fundraising.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Gambling or unauthorized collection'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Not delivering official communications', 'Student failed to deliver important school notices.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Not delivering official communications'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Rude behavior to visitors or parents', 'Student acted disrespectfully toward guests or parents.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Rude behavior to visitors or parents'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Disrespect to school authorities', 'Student disobeyed or disrespected teachers or staff.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Disrespect to school authorities'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Use of vulgar language repeatedly', 'Student repeatedly used offensive or vulgar language.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Use of vulgar language repeatedly'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Causing chaos during events', 'Student created disorder during school programs.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Causing chaos during events'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Disrespect during flag ceremonies', 'Student behaved improperly during the flag ceremony.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Disrespect during flag ceremonies'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Property damage from mischief', 'Student caused damage to school property due to misbehavior.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Property damage from mischief'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Skipping class / truancy', 'Student was absent from class without valid reason.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Skipping class / truancy'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Entering/exiting without permission', 'Student entered or left the campus without authorization.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Entering/exiting without permission'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Public display of affection', 'Student engaged in PDA on school grounds.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Public display of affection'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Minor vandalism', 'Student committed small-scale vandalism.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Minor vandalism'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Posting unauthorized notices', 'Student posted materials on bulletin boards without approval.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Posting unauthorized notices'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Posting offensive content online', 'Student posted inappropriate or harmful content online.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Posting offensive content online'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Removing school announcements', 'Student removed or tampered with posted school announcements.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Removing school announcements'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Gang-like behavior', 'Student displayed behavior associated with gangs.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Gang-like behavior'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Cyberbullying', 'Student bullied or harassed others online.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Cyberbullying'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Gross misconduct', 'Student engaged in unacceptable or highly improper behavior.', 'Serious', 'Serious', 'Parent Summons & Guidance Counseling'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Gross misconduct'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Forgery or document tampering', 'Student altered or falsified official documents.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Forgery or document tampering'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Using fake receipts or forms', 'Student used forged receipts or falsified school forms.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Using fake receipts or forms'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Major vandalism', 'Student caused significant damage to school property.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Major vandalism'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Physical assault', 'Student physically harmed another student or staff.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Physical assault'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Stealing school or class funds', 'Student stole money belonging to the school or class.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Stealing school or class funds'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Extortion or blackmail', 'Student attempted to extort or blackmail another individual.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Extortion or blackmail'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Immoral or scandalous behavior', 'Student engaged in highly inappropriate behavior.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Immoral or scandalous behavior'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Possessing pornography', 'Student possessed explicit or pornographic material.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Possessing pornography'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Criminal charges or conviction', 'Student is involved in criminal activity.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Criminal charges or conviction'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Harassment of students/staff', 'Student harassed or intimidated others on campus.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Harassment of students/staff'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Causing injury requiring hospitalization', 'Student caused injuries that required medical treatment.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Causing injury requiring hospitalization'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Sexual harassment', 'Student committed acts of sexual harassment or misconduct.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Sexual harassment'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Lewd or immoral acts', 'Student participated in obscene or indecent behavior.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Lewd or immoral acts'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Inappropriate social media use', 'Student posted harmful or inappropriate content online.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Inappropriate social media use'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Leaking confidential school info', 'Student disclosed confidential school information.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Leaking confidential school info'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Misusing school logo or name', 'Student used the school logo/name without authorization.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Misusing school logo or name'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Bribing school officials', 'Student attempted to bribe school staff or personnel.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Bribing school officials'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Drinking alcohol in school', 'Student consumed or possessed alcohol on school grounds.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Drinking alcohol in school'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Drug-related activities', 'Student possessed or used illegal drugs.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Drug-related activities'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Bringing deadly weapons', 'Student brought dangerous weapons into school.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Bringing deadly weapons'))
);

-- Insert category if its title is not already present.
INSERT INTO `violations` (`title`, `description`, `type`, `severity`, `default_sanction`)
SELECT 'Joining fraternities/sororities', 'Student participated in prohibited fraternity or sorority groups.', 'Major', 'Major', 'Disciplinary Board Hearing & Suspension'
WHERE NOT EXISTS (
    SELECT 1 FROM `violations`
    WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Joining fraternities/sororities'))
);

-- Source category ID 1: Uniform not worn or worn improperly
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student did not follow the proper uniform guidelines.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Uniform not worn or worn improperly'));

-- Source category ID 2: School ID not worn properly
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student failed to wear or display their ID as required.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('School ID not worn properly'));

-- Source category ID 3: Playing non-educational games
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student used devices to play games unrelated to schoolwork.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Playing non-educational games'));

-- Source category ID 4: Sleeping during class or activities
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student was caught sleeping during lessons or activities.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Sleeping during class or activities'));

-- Source category ID 5: Borrowing or lending money
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student engaged in borrowing or lending money on campus.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Borrowing or lending money'));

-- Source category ID 6: Loitering or shouting in hallways
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student caused disturbance by roaming or shouting in hallways.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Loitering or shouting in hallways'));

-- Source category ID 7: Leaving classroom messy
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student did not clean up their area or left trash behind.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Leaving classroom messy'));

-- Source category ID 8: Use of mobile gadgets without permission
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student used a mobile device without teacher authorization.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Use of mobile gadgets without permission'));

-- Source category ID 9: Excessive jewelry or inappropriate appearance
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student wore accessories not allowed by the dress code.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Excessive jewelry or inappropriate appearance'));

-- Source category ID 10: Wearing inappropriate clothing
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student wore attire that is not allowed in school.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Wearing inappropriate clothing'));

-- Source category ID 11: Using vulgar language
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student used inappropriate or offensive language.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Using vulgar language'));

-- Source category ID 12: Minor bullying or teasing
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student engaged in light bullying, teasing, or mockery.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Minor bullying or teasing'));

-- Source category ID 13: Fighting or causing disturbances
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student caused minor physical or verbal disturbances.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Fighting or causing disturbances'));

-- Source category ID 14: Horseplay inside classroom
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student participated in rough or playful actions inside class.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Horseplay inside classroom'));

-- Source category ID 15: Making inappropriate jokes
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student shared jokes that were inappropriate or offensive.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Making inappropriate jokes'));

-- Source category ID 16: Not completing clearance requirements
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student failed to accomplish clearance tasks on time.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Not completing clearance requirements'));

-- Source category ID 17: Taking food without consent
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student took food items without permission from the owner.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Taking food without consent'));

-- Source category ID 18: Not joining required school activities
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student refused to join mandatory school events.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Not joining required school activities'));

-- Source category ID 19: Chewing gum or spitting in public
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student chewed gum or spat in prohibited areas.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Chewing gum or spitting in public'));

-- Source category ID 20: Buying food during class hours
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student left class or bought food when not allowed.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Buying food during class hours'));

-- Source category ID 21: Using school properties without permission
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student used school equipment without approval.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Using school properties without permission'));

-- Source category ID 22: Forging parent's signature
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student wrote a fake parent or guardian signature.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Forging parent''s signature'));

-- Source category ID 23: Misbehavior in the canteen
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student acted disruptively in the school canteen.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Misbehavior in the canteen'));

-- Source category ID 24: Disturbing class sessions
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student interrupted or distracted ongoing classes.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Disturbing class sessions'));

-- Source category ID 25: Unauthorized playing in the gym
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student used the gym facilities without permission.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Minor'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Minor'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), '1st Offense: Written Reprimand')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Unauthorized playing in the gym'));

-- Source category ID 26: Cheating or academic dishonesty
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student engaged in cheating or dishonest academic practices.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Cheating or academic dishonesty'));

-- Source category ID 27: Plagiarism
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student submitted work copied from others without credit.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Plagiarism'));

-- Source category ID 28: Rough or dangerous play
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student engaged in actions that could harm others.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Rough or dangerous play'));

-- Source category ID 29: Lying or misleading statements
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student intentionally gave false or misleading information.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Lying or misleading statements'));

-- Source category ID 30: Possession of smoking items
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student possessed cigarettes, vapes, or related items.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Possession of smoking items'));

-- Source category ID 31: Vulgar or malicious acts
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student committed vulgar or offensive acts towards others.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Vulgar or malicious acts'));

-- Source category ID 32: Bribery or dishonest acts
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student attempted to bribe or engage in dishonest conduct.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Bribery or dishonest acts'));

-- Source category ID 33: Theft or aiding theft
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student stole or helped others steal property.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Theft or aiding theft'));

-- Source category ID 34: Gambling or unauthorized collection
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student participated in gambling or unapproved fundraising.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Gambling or unauthorized collection'));

-- Source category ID 35: Not delivering official communications
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student failed to deliver important school notices.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Not delivering official communications'));

-- Source category ID 36: Rude behavior to visitors or parents
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student acted disrespectfully toward guests or parents.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Rude behavior to visitors or parents'));

-- Source category ID 37: Disrespect to school authorities
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student disobeyed or disrespected teachers or staff.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Disrespect to school authorities'));

-- Source category ID 38: Use of vulgar language repeatedly
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student repeatedly used offensive or vulgar language.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Use of vulgar language repeatedly'));

-- Source category ID 39: Causing chaos during events
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student created disorder during school programs.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Causing chaos during events'));

-- Source category ID 40: Disrespect during flag ceremonies
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student behaved improperly during the flag ceremony.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Disrespect during flag ceremonies'));

-- Source category ID 41: Property damage from mischief
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student caused damage to school property due to misbehavior.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Property damage from mischief'));

-- Source category ID 42: Skipping class / truancy
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student was absent from class without valid reason.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Skipping class / truancy'));

-- Source category ID 43: Entering/exiting without permission
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student entered or left the campus without authorization.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Entering/exiting without permission'));

-- Source category ID 44: Public display of affection
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student engaged in PDA on school grounds.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Public display of affection'));

-- Source category ID 45: Minor vandalism
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student committed small-scale vandalism.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Minor vandalism'));

-- Source category ID 46: Posting unauthorized notices
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student posted materials on bulletin boards without approval.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Posting unauthorized notices'));

-- Source category ID 47: Posting offensive content online
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student posted inappropriate or harmful content online.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Posting offensive content online'));

-- Source category ID 48: Removing school announcements
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student removed or tampered with posted school announcements.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Removing school announcements'));

-- Source category ID 49: Gang-like behavior
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student displayed behavior associated with gangs.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Gang-like behavior'));

-- Source category ID 50: Cyberbullying
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student bullied or harassed others online.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Cyberbullying'));

-- Source category ID 51: Gross misconduct
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student engaged in unacceptable or highly improper behavior.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Serious'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Serious'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Parent Summons & Guidance Counseling')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Gross misconduct'));

-- Source category ID 52: Forgery or document tampering
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student altered or falsified official documents.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Forgery or document tampering'));

-- Source category ID 53: Using fake receipts or forms
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student used forged receipts or falsified school forms.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Using fake receipts or forms'));

-- Source category ID 54: Major vandalism
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student caused significant damage to school property.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Major vandalism'));

-- Source category ID 55: Physical assault
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student physically harmed another student or staff.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Physical assault'));

-- Source category ID 56: Stealing school or class funds
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student stole money belonging to the school or class.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Stealing school or class funds'));

-- Source category ID 57: Extortion or blackmail
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student attempted to extort or blackmail another individual.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Extortion or blackmail'));

-- Source category ID 58: Immoral or scandalous behavior
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student engaged in highly inappropriate behavior.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Immoral or scandalous behavior'));

-- Source category ID 59: Possessing pornography
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student possessed explicit or pornographic material.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Possessing pornography'));

-- Source category ID 60: Criminal charges or conviction
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student is involved in criminal activity.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Criminal charges or conviction'));

-- Source category ID 61: Harassment of students/staff
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student harassed or intimidated others on campus.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Harassment of students/staff'));

-- Source category ID 62: Causing injury requiring hospitalization
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student caused injuries that required medical treatment.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Causing injury requiring hospitalization'));

-- Source category ID 63: Sexual harassment
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student committed acts of sexual harassment or misconduct.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Sexual harassment'));

-- Source category ID 64: Lewd or immoral acts
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student participated in obscene or indecent behavior.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Lewd or immoral acts'));

-- Source category ID 65: Inappropriate social media use
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student posted harmful or inappropriate content online.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Inappropriate social media use'));

-- Source category ID 66: Leaking confidential school info
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student disclosed confidential school information.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Leaking confidential school info'));

-- Source category ID 67: Misusing school logo or name
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student used the school logo/name without authorization.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Misusing school logo or name'));

-- Source category ID 68: Bribing school officials
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student attempted to bribe school staff or personnel.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Bribing school officials'));

-- Source category ID 69: Drinking alcohol in school
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student consumed or possessed alcohol on school grounds.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Drinking alcohol in school'));

-- Source category ID 70: Drug-related activities
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student possessed or used illegal drugs.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Drug-related activities'));

-- Source category ID 71: Bringing deadly weapons
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student brought dangerous weapons into school.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Bringing deadly weapons'));

-- Source category ID 73: Joining fraternities/sororities
UPDATE `violations`
SET `description` = COALESCE(NULLIF(TRIM(`description`), ''), 'Student participated in prohibited fraternity or sorority groups.'),
    `type` = COALESCE(NULLIF(TRIM(`type`), ''), 'Major'),
    `severity` = COALESCE(NULLIF(TRIM(`severity`), ''), 'Major'),
    `default_sanction` = COALESCE(NULLIF(TRIM(`default_sanction`), ''), 'Disciplinary Board Hearing & Suspension')
WHERE LOWER(TRIM(`title`)) = LOWER(TRIM('Joining fraternities/sororities'));

COMMIT;

SELECT COUNT(*) AS total_violation_rows FROM `violations`;
