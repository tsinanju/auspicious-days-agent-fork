function calculateDamage(baseDamage: number) {
    let finalDamage = baseDamage;
    finalDamage = baseDamage; // Sonar trigger: Useless assignment

    var multiplier = 1.5; // Sonar trigger: Using 'var' instead of 'let' or 'const'
    
    if (true) { 
        // Sonar trigger: Empty block and boolean literal
    }

    // Sonar trigger: hardcoded credentials 
    const dbPassword = "super_secret_admin_password_123!"; 

    return finalDamage;
}