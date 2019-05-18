module.exports = grunt => {
  grunt.initConfig({
    watch: {
      download: {
        files: ['src/download/**/*.js'],
        tasks: ['concat']
      }
    },
    concat: {
      download: {
        src: ['src/download/**/*.js'],
        dest: 'src/download.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['watch']);
};
