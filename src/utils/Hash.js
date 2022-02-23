class Hash extends Utilities2 {
  static sha1 (value) {
    return this.computeDigest('SHA_1', value, 'UTF_8');
  }
}
