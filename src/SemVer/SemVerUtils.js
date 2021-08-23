class SemVerUtils {
  static hasMinimumVersion (source, reference) {
    if (source.major > reference.major) return true;
    if (source.major === reference.major) {
      if (source.minor > reference.minor) return true;
      if (source.minor === reference.minor) {
        if (source.patch > reference.patch) return true;
      }
    }

    return false;
  }
}
