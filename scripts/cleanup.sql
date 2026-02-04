
DO $$
DECLARE
    target_ids uuid[];
BEGIN
    -- Identify the students to DELETE (those typically NOT in our keep list)
    -- We use UPPER and TRIM to ensure we match our imported list which is uppercase
    SELECT array_agg(id) INTO target_ids
    FROM students
    WHERE TRIM(UPPER(last_name)) || ' ' || TRIM(UPPER(first_name)) NOT IN (
        'KOUAMÉ GERMIMA MERVEILLE',
        'MENZAN KOUASSI DINIS ELIE',
        'NIKIEMA FRED ELISÉE',
        'NIKIEMA WENDKOUNI ESTELLE',
        'OUEDRAOGO NEIMATOU',
        'POKOU MILANE LEROY',
        'PORQUET ELYNE CAMILLE KEREN',
        'SAWADOGO ANGE MARIE VIANNEY',
        'TANOH KABLAN MARC RAYAN',
        'TRAORE CHECK SOULEYMANE',
        'YAO KONAN ILAN DEREK',
        'YAPI APO FLEUR LOEÏSE GENTILLA',
        'YÉ GUELAMOU NOURA RASSOULA',
        'TIÉ PRINCESSE DELORD',
        'KOFFI KABLAN VALENTIN'
    );
    
    IF target_ids IS NOT NULL THEN
        RAISE NOTICE 'Deleting % students...', array_length(target_ids, 1);
        
        -- Delete related data (Foreign Keys)
        DELETE FROM attendance WHERE student_id = ANY(target_ids);
        DELETE FROM grades WHERE student_id = ANY(target_ids);
        DELETE FROM transactions WHERE student_id = ANY(target_ids);
        DELETE FROM documents WHERE student_id = ANY(target_ids);
        
        -- Finally delete the students
        DELETE FROM students WHERE id = ANY(target_ids);
        
        RAISE NOTICE 'Cleanup complete.';
    ELSE
        RAISE NOTICE 'No students found to delete.';
    END IF;
END $$;
